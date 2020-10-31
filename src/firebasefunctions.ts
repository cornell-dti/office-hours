import { firestore, auth } from 'firebase/app';
import { datePlus, normalizeDateToDateStart, normalizeDateToWeekStart } from './utilities/date';
import { blockArray } from './firehooks';

/* Basic Functions */

export const userUpload = (user: firebase.User | null, db: firebase.firestore.Firestore) => {
    if (user != null) {
        const uid = user.uid;
        const email = user.email || 'Dummy Email';
        const displayName = user.displayName || 'Dummy name';
        const photoUrl = user.photoURL || 'Dummy photo';
        let stringSplit = -1;
        let firstName = displayName;
        let lastName = '';
        if (displayName != null) {
            stringSplit = displayName.indexOf(' ');
            if (stringSplit !== -1) {
                firstName = displayName.substring(0, stringSplit);
                lastName = displayName.substring(stringSplit + 1);
            }
        }
        db.runTransaction(async (transaction) => {
            const userDocumentReference = db.collection('users').doc(uid);
            const userDocument = await transaction.get(userDocumentReference);
            if (userDocument.exists) {
                const partialUserDocument: Partial<FireUser> = {
                    email,
                    firstName,
                    lastName,
                    photoUrl,
                };
                transaction.update(userDocumentReference, partialUserDocument);
            } else {
                const fullUserDocument: Omit<FireUser, 'userId'> = {
                    email,
                    firstName,
                    lastName,
                    photoUrl,
                    courses: [],
                    roles: {},
                };
                transaction.set(userDocumentReference, fullUserDocument);
            }
            // eslint-disable-next-line no-console
        }).catch(() => console.error('Unable to upload user.'));
    }
};

export const logOut = () => {
    auth()
        .signOut()
        .then(() => {
            // Success
        })
        .catch(() => {
            // Fail
        });
};

/* Series Functions */

const getWeekOffsets = (
    sessionSeries: Omit<FireSessionSeries, 'sessionSeriesId'>
): [number, number] => {
    const { startTime: seriesStartFireTimestamp, endTime: seriesEndFireTimestamp } = sessionSeries;
    const rawStart = seriesStartFireTimestamp.toDate();
    const rawEnd = seriesEndFireTimestamp.toDate();
    return [
        rawStart.getTime() - normalizeDateToWeekStart(rawStart).getTime(),
        rawEnd.getTime() - normalizeDateToWeekStart(rawEnd).getTime(),
    ];
};

export const createSeries = async (
    db: firebase.firestore.Firestore,
    sessionSeries: FireSessionSeriesDefinition
): Promise<void> => {
    const courseDoc = await db.collection('courses').doc(sessionSeries.courseId).get();
    const [courseStartWeek, courseEndWeek, courseStartDate, courseEndDate] = (() => {
        const {
            startDate: courseStartFireTimestamp,
            endDate: courseEndFireTimestamp,
        } = courseDoc.data() as FireCourse;
        const rawStart = courseStartFireTimestamp.toDate();
        const rawEnd = courseEndFireTimestamp.toDate();
        return [
            normalizeDateToWeekStart(rawStart),
            normalizeDateToWeekStart(rawEnd),
            normalizeDateToDateStart(rawStart),
            normalizeDateToDateStart(rawEnd),
        ];
    })();
    const [sessionStartOffset, sessionEndOffset] = getWeekOffsets(sessionSeries);
    const now = new Date();
    const currentDate = new Date(courseStartWeek);
    const batch = db.batch();
    const sessionSeriesId = db.collection('sessions').doc().id;
    while (currentDate <= courseEndWeek) {
        // Create new course only if:
        // - the session is not already the past
        // - the session is after course start date
        // - the session is before (course end date + 1 day)
        const sessionStart = datePlus(currentDate, sessionStartOffset);
        const sessionEnd = datePlus(currentDate, sessionEndOffset);
        if (
            sessionEnd > now &&
            sessionStart >= courseStartDate &&
            sessionStart <= datePlus(courseEndDate, 1000 * 60 * 60 * 24)
        ) {
            if (sessionSeries.modality === 'virtual') {
                const derivedSession: Omit<FireVirtualSession, 'sessionId'> = {
                    modality: sessionSeries.modality,
                    sessionSeriesId,
                    courseId: sessionSeries.courseId,
                    endTime: firestore.Timestamp.fromDate(sessionEnd),
                    startTime: firestore.Timestamp.fromDate(sessionStart),
                    tas: sessionSeries.tas,
                    title: sessionSeries.title,
                    totalQuestions: 0,
                    assignedQuestions: 0,
                    resolvedQuestions: 0,
                    totalWaitTime: 0,
                    totalResolveTime: 0,
                };

                batch.set(db.collection('sessions').doc(), derivedSession);
            } else if (sessionSeries.modality === "review") {
                const derivedSession: Omit<FireReviewSession, 'sessionId'> = {
                    modality: sessionSeries.modality,
                    sessionSeriesId,
                    courseId: sessionSeries.courseId,
                    endTime: firestore.Timestamp.fromDate(sessionEnd),
                    startTime: firestore.Timestamp.fromDate(sessionStart),
                    tas: sessionSeries.tas,
                    title: sessionSeries.title,
                    totalQuestions: 0,
                    assignedQuestions: 0,
                    resolvedQuestions: 0,
                    totalWaitTime: 0,
                    totalResolveTime: 0,
                    link: sessionSeries.link
                };

                batch.set(db.collection('sessions').doc(), derivedSession);
            } else {
                const derivedSession: Omit<FireInPersonSession | FireHybridSession, 'sessionId'> = {
                    sessionSeriesId,
                    modality: sessionSeries.modality,
                    building: sessionSeries.building,
                    courseId: sessionSeries.courseId,
                    endTime: firestore.Timestamp.fromDate(sessionEnd),
                    room: sessionSeries.room,
                    startTime: firestore.Timestamp.fromDate(sessionStart),
                    tas: sessionSeries.tas,
                    title: sessionSeries.title,
                    totalQuestions: 0,
                    assignedQuestions: 0,
                    resolvedQuestions: 0,
                    totalWaitTime: 0,
                    totalResolveTime: 0,
                };

                batch.set(db.collection('sessions').doc(), derivedSession);
            }
        }
        currentDate.setDate(currentDate.getDate() + 7); // move 1 week forward.
    }
    await batch.commit();
};

export const updateSeries = async (
    db: firebase.firestore.Firestore,
    sessionSeriesId: string,
    sessionSeries: FireSessionSeriesDefinition
): Promise<void> => {
    const [sessionStartOffset, sessionEndOffset] = getWeekOffsets(sessionSeries);
    const querySnapshot = await db
        .collection('sessions')
        .where('sessionSeriesId', '==', sessionSeriesId)
        .get();
    const batch = db.batch();
    querySnapshot.forEach((sessionDocument) => {
        const sessionId = sessionDocument.id;
        const oldSession = sessionDocument.data() as Omit<FireSession, 'sessionId'>;
        const startTime = firestore.Timestamp.fromDate(
            datePlus(normalizeDateToWeekStart(oldSession.startTime.toDate()), sessionStartOffset)
        );
        const endTime = firestore.Timestamp.fromDate(
            datePlus(normalizeDateToWeekStart(oldSession.endTime.toDate()), sessionEndOffset)
        );

        if (sessionSeries.modality === 'virtual') {
            const newSession: Omit<FireVirtualSession, 'sessionId'> = {
                sessionSeriesId,
                courseId: sessionSeries.courseId,
                modality: sessionSeries.modality,
                endTime,
                startTime,
                tas: sessionSeries.tas,
                title: sessionSeries.title,
                totalQuestions: 0,
                assignedQuestions: 0,
                resolvedQuestions: 0,
                totalWaitTime: 0,
                totalResolveTime: 0,
            };
            batch.set(db.collection('sessions').doc(sessionId), newSession);
        } else if (sessionSeries.modality === "review") {
            const newSession: Omit<FireReviewSession, 'sessionId'> = {
                sessionSeriesId,
                courseId: sessionSeries.courseId,
                modality: sessionSeries.modality,
                endTime,
                startTime,
                tas: sessionSeries.tas,
                title: sessionSeries.title,
                totalQuestions: 0,
                assignedQuestions: 0,
                resolvedQuestions: 0,
                totalWaitTime: 0,
                totalResolveTime: 0,
                link: sessionSeries.link
            };
            batch.set(db.collection('sessions').doc(sessionId), newSession);
        } else {
            const newSession: Omit<FireHybridSession | FireInPersonSession, 'sessionId'> = {
                sessionSeriesId,
                modality: sessionSeries.modality,
                building: sessionSeries.building,
                courseId: sessionSeries.courseId,
                endTime,
                room: sessionSeries.room,
                startTime,
                tas: sessionSeries.tas,
                title: sessionSeries.title,
                totalQuestions: 0,
                assignedQuestions: 0,
                resolvedQuestions: 0,
                totalWaitTime: 0,
                totalResolveTime: 0,
            };
            batch.set(db.collection('sessions').doc(sessionId), newSession);
        }

    });
    await batch.commit();
};

export const deleteSeries = async (db: firebase.firestore.Firestore, sessionSeriesId: string): Promise<void> => {
    const querySnapshot = await db.collection('sessions').where('sessionSeriesId', '==', sessionSeriesId).get();
    const batch = db.batch();
    querySnapshot.docs.forEach((document) =>
        batch.delete(db.collection('sessions').doc(document.id))
    );
    await batch.commit();
};

/* User Management Functions */

const getUserRoleUpdate = (
    user: FireUser,
    courseId: string,
    role: FireCourseRole
): Partial<FireUser> => {
    const courses = [...user.courses];
    if (!courses.includes(courseId)) {
        courses.push(courseId);
    }
    const roles = { ...user.roles };
    if (role === 'student') {
        delete roles[courseId];
    } else {
        roles[courseId] = role;
    }
    return { courses, roles };
};

const getCourseRoleUpdate = (
    course: FireCourse,
    userId: string,
    newRole: FireCourseRole
): Partial<FireCourse> => ({
    professors: addOrRemoveFromRoleIdList(newRole === 'professor', course.professors, userId),
    tas: addOrRemoveFromRoleIdList(newRole === 'ta', course.tas, userId),
});

const getCourseRoleUpdates = (
    course: FireCourse,
    userRoleUpdates: readonly (readonly [string, FireCourseRole])[]
): Partial<FireCourse> => {
    const professors = userRoleUpdates.reduce(
        (previousProfessors, [userId, newRole]) =>
            addOrRemoveFromRoleIdList(newRole === 'professor', previousProfessors, userId),
        course.professors
    );
    const tas = userRoleUpdates.reduce(
        (previousTAs, [userId, newRole]) =>
            addOrRemoveFromRoleIdList(newRole === 'ta', previousTAs, userId),
        course.tas
    );
    return { professors, tas };
};

const importProfessorsOrTAs = async (
    db: firebase.firestore.Firestore,
    course: FireCourse,
    role: 'professor' | 'ta',
    emailListTotal: readonly string[]
): Promise<void> => {
    const missingSet = new Set(emailListTotal);
    const batch = db.batch();
    const updatedUsers: FireUser[] = [];

    const emailBlocks = blockArray(emailListTotal, 10);

    Promise.all(emailBlocks.map(emailList => {
        return db.collection('users').where('email', 'in', emailList).get().then(taUserDocuments => {
            // const updatedUsersThisBlock: FireUser[] = [];
            // const userUpdatesThisBlock: Partial<FireUser>[] = [];
            const updatesThisBlock: { user: FireUser; roleUpdate: Partial<FireUser> }[] = [];

            taUserDocuments.forEach((document) => {
                const existingUser = { userId: document.id, ...document.data() } as FireUser;
                const roleUpdate = getUserRoleUpdate(existingUser, course.courseId, role);
                updatesThisBlock.push({
                    user: existingUser,
                    roleUpdate
                })
            });

            return updatesThisBlock;
        });

    })).then(updatedBlocks => {
        const allUpdates: { user: FireUser; roleUpdate: Partial<FireUser> }[] = [];

        updatedBlocks.forEach(updateBlock => {
            updateBlock.forEach(({ user, roleUpdate }) => {
                const { email } = user;
                updatedUsers.push(user);
                missingSet.delete(email);
                allUpdates.push({ user, roleUpdate });
                // update user's roles table
                batch.update(db.collection('users').doc(user.userId), roleUpdate);
            })

        });
        // update course's ta/professor roles
        batch.update(
            db.collection('courses').doc(course.courseId),
            getCourseRoleUpdates(
                course,
                allUpdates.map(({ user }) => [user.userId, role] as const)
            )
        )


        batch.commit();
    }).then(() => {
        const message =
            'Successfully\n' +
            `updated: [${updatedUsers.map((user) => user.email).join(', ')}];\n` +
            `[${Array.from(missingSet).join(', ')}] do not exist in our system yet.`;
        // eslint-disable-next-line no-alert
        alert(message);
    });


};

const addOrRemoveFromRoleIdList = (
    isAdd: boolean,
    roleIdList: readonly string[],
    userId: string
): readonly string[] => {
    if (isAdd) {
        return roleIdList.includes(userId) ? roleIdList : [...roleIdList, userId];
    }
    return roleIdList.filter((id) => id !== userId);
};

export const changeRole = (
    db: firebase.firestore.Firestore,
    user: FireUser,
    course: FireCourse,
    newRole: FireCourseRole
): void => {
    const batch = db.batch();
    batch.update(
        db.collection('users').doc(user.userId),
        getUserRoleUpdate(user, course.courseId, newRole)
    );
    batch.update(
        db.collection('courses').doc(course.courseId),
        getCourseRoleUpdate(course, user.userId, newRole)
    );
    batch.commit();
};

export const importProfessorsOrTAsFromPrompt = (
    db: firebase.firestore.Firestore,
    course: FireCourse,
    role: 'professor' | 'ta'
): void => {
    // eslint-disable-next-line no-alert
    const response = prompt(
        `Please enter a comma-separated list of ${role === 'professor' ? role : 'TA'} emails:`
    );
    if (response != null) {
        importProfessorsOrTAs(
            db,
            course,
            role,
            response.split(',').map((email) => email.trim())
        );
    }
};

export const updateVirtualLocation = (
    db: firebase.firestore.Firestore,
    user: FireUser,
    session: FireSession,
    virtualLocation: string): Promise<void> => {
    return db.doc(`/sessions/${session.sessionId}/profiles/${user.userId}`).set({
        virtualLocation
    }, {
        merge: true
    }).then(() => {})
};
