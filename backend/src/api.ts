import { auth } from 'firebase/app';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as mongo from 'mongodb';
import { v4 as uuid } from 'uuid';
import { datePlus, normalizeDateToDateStart, normalizeDateToWeekStart } from '../../src/utilities/date';
import { blockArray } from '../../src/firehooks';
import { QMIUser, 
    QMISession, 
    QMICourse, 
    QMICourseRole, 
    QMIVirtualSession,
    QMIHybridSession,
    QMIInPersonSession, 
    QMISessionSeriesDefinition,
    QMISessionSeries 
} from './types';
/* Basic Functions */

export const userUpload = async (user: firebase.User | null, db: mongo.Db) => {
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
        try {
            const users = db.collection<QMIUser & {_id?: string}>('users');
            const userDocument = await users.findOne({ _id: uid });
          
            if (userDocument) {
                const partialUserDocument: Partial<QMIUser> = {
                    email,
                    firstName,
                    lastName,
                    photoUrl,
                };
                users.updateOne({ _id: uid }, partialUserDocument);
            } else {
                const fullUserDocument: QMIUser = {
                    _id: uid,
                    email,
                    firstName,
                    lastName,
                    photoUrl,
                    courses: [],
                    roles: {},
                };
                await users.insert(fullUserDocument);
            }
            // eslint-disable-next-line no-console
        } catch (error) { console.error('Unable to upload user.') }
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
    sessionSeries: Omit<QMISessionSeries, 'sessionSeriesId'>
): [number, number] => {
    const { startTime: seriesStartQMITimestamp, endTime: seriesEndQMITimestamp } = sessionSeries;
    const rawStart = seriesStartQMITimestamp;
    const rawEnd = seriesEndQMITimestamp;
    return [
        rawStart.getTime() - normalizeDateToWeekStart(rawStart).getTime(),
        rawEnd.getTime() - normalizeDateToWeekStart(rawEnd).getTime(),
    ];
};

function queryById(id: string) {
    return {
        _id: id
    }
}

export const createSeries = async (
    db: mongo.Db,
    sessionSeries: QMISessionSeriesDefinition
): Promise<void> => {
    const courseDoc = await db.collection<QMICourse>('courses').findOne(queryById(sessionSeries.courseId));
    
    if (!courseDoc) {
        throw new Error("No such course found!");
    }

    const [courseStartWeek, courseEndWeek, courseStartDate, courseEndDate] = (() => {
        const {
            startDate: courseStartQMITimestamp,
            endDate: courseEndQMITimestamp,
        } = courseDoc;
        const rawStart = courseStartQMITimestamp;
        const rawEnd = courseEndQMITimestamp;
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
    const batch = db.collection('sessions').initializeUnorderedBulkOp();
    const sessionSeriesId = uuid();
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
                const derivedSession: Omit<QMIVirtualSession, '_id'> = {
                    modality: sessionSeries.modality,
                    sessionSeriesId,
                    courseId: sessionSeries.courseId,
                    endTime: sessionEnd,
                    startTime: sessionStart,
                    tas: sessionSeries.tas,
                    title: sessionSeries.title,
                };

                batch.insert(derivedSession);
            } else {
                const derivedSession: Omit<QMIInPersonSession | QMIHybridSession, '_id'> = {
                    sessionSeriesId,
                    modality: sessionSeries.modality,
                    building: sessionSeries.building,
                    courseId: sessionSeries.courseId,
                    endTime: (sessionEnd),
                    room: sessionSeries.room,
                    startTime: (sessionStart),
                    tas: sessionSeries.tas,
                    title: sessionSeries.title,
                };

                batch.insert(derivedSession);
            }
        }
        currentDate.setDate(currentDate.getDate() + 7); // move 1 week forward.
    }
    await batch.execute();
};

export const updateSeries = async (
    db: mongo.Db,
    sessionSeriesId: string,
    sessionSeries: QMISessionSeriesDefinition
): Promise<void> => {
    const [sessionStartOffset, sessionEndOffset] = getWeekOffsets(sessionSeries);
    const querySnapshot = await db
        .collection('sessions')
        .find<QMISessionSeries>({
        "sessionSeriesId": {
            $eq: sessionSeriesId
        }
    });
    const batch = db.collection('sessions').initializeUnorderedBulkOp();
    querySnapshot.forEach((sessionDocument) => {
        const sessionId = sessionDocument._id;
        const oldSession = sessionDocument as Omit<QMISession, 'sessionId'>;
        const startTime = (
            datePlus(normalizeDateToWeekStart(oldSession.startTime), sessionStartOffset)
        );
        const endTime = (
            datePlus(normalizeDateToWeekStart(oldSession.endTime), sessionEndOffset)
        );

        if (sessionSeries.modality === 'virtual') {
            const newSession: Omit<QMIVirtualSession, '_id'> = {
                sessionSeriesId,
                courseId: sessionSeries.courseId,
                modality: sessionSeries.modality,
                endTime,
                startTime,
                tas: sessionSeries.tas,
                title: sessionSeries.title,
            };
            batch.insert(newSession);
            batch.find(queryById(sessionId)).replaceOne(newSession);
        } else {
            const newSession: Omit<QMIHybridSession | QMIInPersonSession, '_id'> = {
                sessionSeriesId,
                modality: sessionSeries.modality,
                building: sessionSeries.building,
                courseId: sessionSeries.courseId,
                endTime,
                room: sessionSeries.room,
                startTime,
                tas: sessionSeries.tas,
                title: sessionSeries.title,
            };
            batch.find(queryById(sessionId)).replaceOne(newSession);
        }

    });
    await batch.execute();
};

export const deleteSeries = async (db: mongo.Db, sessionSeriesId: string): Promise<void> => {
    const batch = db.collection<QMISessionSeries>('sessions').initializeUnorderedBulkOp();

    batch.find({'sessionSeriesId': { $eq: sessionSeriesId}}).remove();

    await batch.execute();
};

/* User Management Functions */

const getUserRoleUpdate = (
    user: QMIUser,
    courseId: string,
    role: QMICourseRole
): Partial<QMIUser> => {
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
    course: QMICourse,
    userId: string,
    newRole: QMICourseRole
): Partial<QMICourse> => ({
    professors: addOrRemoveFromRoleIdList(newRole === 'professor', course.professors, userId),
    tas: addOrRemoveFromRoleIdList(newRole === 'ta', course.tas, userId),
});

const getCourseRoleUpdates = (
    course: QMICourse,
    userRoleUpdates: readonly (readonly [string, QMICourseRole])[]
): Partial<QMICourse> => {
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
    db: mongo.Db,
    course: QMICourse,
    role: 'professor' | 'ta',
    emailListTotal: readonly string[]
): Promise<string> => {
    const missingSet = new Set(emailListTotal);
    const batch = db.collection('users').initializeUnorderedBulkOp();
    const updatedUsers: QMIUser[] = [];

    const emailBlocks = blockArray(emailListTotal, 10);
    const allUpdates = [] as string[];
    
    const result = await Promise.all(emailBlocks.map(emailList => {
        return db.collection('users').find<QMIUser>({ email: {
            $in: emailList
        }}).forEach(document => {
            const user = { ...document } as QMIUser;
            const roleUpdate = getUserRoleUpdate(user, course._id, role);
            const { email } = user;
            updatedUsers.push(user);
            missingSet.delete(email);
            
            allUpdates.push(user._id);
            // update user's roles table
            batch.find({ _id: user._id }).updateOne(roleUpdate);
        });
    })).then(() => {
        batch.execute();

        // update course's ta/professor roles
        return db.collection('courses').updateOne({ _id: course._id }, getCourseRoleUpdates(
            course,
            allUpdates.map((userid) => [userid, role] as const)
        ));
    }).then(() => {
        const message =
            'Successfully\n' +
            `updated: [${updatedUsers.map((user) => user.email).join(', ')}];\n` +
            `[${Array.from(missingSet).join(', ')}] do not exist in our system yet.`;
        return message;
    });

    return result ?? "Error.";
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

export const changeRole = async (
    db: mongo.Db,
    user: QMIUser,
    course: QMICourse,
    newRole: QMICourseRole
): Promise<void> => {
    await      db.collection('users').updateOne(queryById(user._id), getUserRoleUpdate(user, course._id, newRole))
    await  db.collection('courses').updateOne(queryById(course._id), 
        getCourseRoleUpdate(course, user._id, newRole)
    );
};

export const importProfessorsOrTAsFromPrompt = (
    db: mongo.Db,
    course: QMICourse,
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
    db: mongo.Db,
    user: QMIUser,
    session: QMISession,
    virtualLocation: string): Promise<void> => {
    return db.collection(`sessionProfiles`).updateOne({ ...queryById(user._id), upsert: true}, {
        _sessionId: session._id,
        virtualLocation
    }).then(() => {})
};
