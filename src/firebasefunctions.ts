/* eslint-disable @typescript-eslint/indent */

import { firestore, auth } from 'firebase/app';
import { datePlus, normalizeDateToDateStart, normalizeDateToWeekStart } from './utilities/date';

/* Basic Functions */

export const userUpload = (user: firebase.User | null, db: firebase.firestore.Firestore) => {
    if (user != null) {
        const uid = user.uid;
        const email = user.email || 'Dummy Display Name';
        const displayName = user.displayName || 'Dummy Email';
        const photoUrl = user.photoURL || 'Dummy Display Name';
        const metaData = user.metadata;
        const createdAt = firestore.Timestamp.fromDate(
            metaData.creationTime ? new Date(metaData.creationTime) : new Date()
        );
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
        const lastActivityAt = (firestore.FieldValue.serverTimestamp() as unknown) as FireTimestamp;
        db.runTransaction(async (transaction) => {
            const userDocumentReference = db.collection('users').doc(uid);
            const userDocument = await transaction.get(userDocumentReference);
            if (userDocument.exists) {
                const partialUserDocument: Partial<FireUser> = {
                    email,
                    firstName,
                    lastName,
                    photoUrl,
                    createdAt,
                    lastActivityAt,
                };
                transaction.update(userDocumentReference, partialUserDocument);
            } else {
                const fullUserDocument: Omit<FireUser, 'userId'> = {
                    email,
                    firstName,
                    lastName,
                    photoUrl,
                    createdAt,
                    lastActivityAt,
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
    sessionSeries: Omit<FireSessionSeries, 'sessionSeriesId'>
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
            const derivedSession: Omit<FireSession, 'sessionId'> = {
                sessionSeriesId,
                building: sessionSeries.building,
                courseId: sessionSeries.courseId,
                endTime: firestore.Timestamp.fromDate(sessionEnd),
                room: sessionSeries.room,
                startTime: firestore.Timestamp.fromDate(sessionStart),
                tas: sessionSeries.tas,
                title: sessionSeries.title,
            };
            batch.set(db.collection('sessions').doc(), derivedSession);
        }
        currentDate.setDate(currentDate.getDate() + 7); // move 1 week forward.
    }
    await batch.commit();
};

export const updateSeries = async (
    db: firebase.firestore.Firestore,
    sessionSeriesId: string,
    sessionSeries: Omit<FireSessionSeries, 'sessionSeriesId'>
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
        const newSession: Omit<FireSession, 'sessionId'> = {
            sessionSeriesId,
            building: sessionSeries.building,
            courseId: sessionSeries.courseId,
            endTime,
            room: sessionSeries.room,
            startTime,
            tas: sessionSeries.tas,
            title: sessionSeries.title,
        };
        batch.set(db.collection('sessions').doc(sessionId), newSession);
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

/**
 * Updates a user's "roles" table. Returns the user's
 * updated courses list, and the user's the updated roles table.
 * @param user 
 * @param courseId 
 * @param role 
 */
const getUserRoleUpdate = (
    user: Pick<FireUser, 'courses' | 'roles'>,
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

/**
 * Update user roles to reflect new professor, TAs
 * @param course 
 * @param userRoleUpdates 
 */
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

/**
 * Imports either Professor or TAs to a course in a single batched write.
 * Update roles table of each user.
 * Update users' roles of the table.
 * @param db 
 * @param course 
 * @param role 
 * @param emailList 
 */
const importProfessorsOrTAs = async (
    db: firebase.firestore.Firestore,
    course: FireCourse,
    role: 'professor' | 'ta',
    emailList: readonly string[]
): Promise<void> => {
    const taUserQuery = db.collection('users').where('email', 'in', emailList).get();
    const pendingUserQuery = db.collection('pendingTas').where('email', 'in', emailList).get();
    const missingSet = new Set(emailList);
    const batch = db.batch();
    const updatedUsers: FireUser[] = [];

    // users that aren't even pending
    const uncreatedUsers: Partial<FireUser>[] = [];

    return Promise.all([taUserQuery, pendingUserQuery]).then(([taUserDocs, pendingUserDocs]) => {
        taUserDocs.forEach((document) => {
            const existingUser = { userId: document.id, ...document.data() } as FireUser;
            const { email } = existingUser;
            const roleUpdate = getUserRoleUpdate(existingUser, course.courseId, role);
            batch.update(db.collection('users').doc(existingUser.userId), roleUpdate);
            updatedUsers.push(existingUser);
            missingSet.delete(email);
        });

        batch.update(
            db.collection('courses').doc(course.courseId),
            getCourseRoleUpdates(
                course,
                updatedUsers.map((user) => [user.userId, role] as const)
            )
        );

        // pending users that didn't create an account yet, but were
        // requested as prof | ta before already: just add to their roles
        pendingUserDocs.forEach(doc => {
            const pendingUser: Pick<FireUser, 'courses' | 'roles' | 'userId'> = {
                userId: doc.id, ...doc.data()
            } as Pick<FireUser, 'courses' | 'roles' | 'userId'>;

            const roleUpdate = getUserRoleUpdate(pendingUser, course.courseId, role);

            batch.update(db.collection('pendingTas').doc(pendingUser.userId), roleUpdate);
        });
    }).then(_ => {
        batch.commit();
        const message =
            'Successfully\n' +
            `updated: [${updatedUsers.map((user) => user.email).join(', ')}];\n` +
            `[${Array.from(missingSet).join(', ')}] do not exist in our system yet.`;
        alert(message);
    })
};

/**
 * Conditionally add or remove user from a course's roles list.
 * @param isAdd 
 * @param roleIdList 
 * @param userId 
 */
const addOrRemoveFromRoleIdList = (
    isAdd: boolean,
    roleIdList: readonly string[],
    userId: string
): readonly string[] => {
    if (isAdd) {
        return roleIdList.includes(userId) ? roleIdList : [...roleIdList, userId];
    } else {
        return roleIdList.filter((id) => id !== userId);
    }
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
