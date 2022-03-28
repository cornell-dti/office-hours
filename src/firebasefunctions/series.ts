import firebase from 'firebase/app';
import moment from 'moment-timezone';
import { getDateRange, syncTimes } from '../utilities/date';


const firestore = firebase.firestore;

export const createSeries = async (
    db: firebase.firestore.Firestore,
    sessionSeries: FireSessionSeriesDefinition
): Promise<void> => {
    const courseDoc = await db.collection('courses').doc(sessionSeries.courseId).get();
    const courseData = courseDoc.data() as FireCourse;

    const sessionSeriesId = db.collection('sessions').doc().id;

    const startTime = moment(sessionSeries.startTime.toDate()).tz("America/New_York");
    const endTime = moment(sessionSeries.endTime.toDate()).tz("America/New_York");
    const duration = endTime.diff(startTime);

    const courseStartTime = moment(courseData.startDate.toDate()).tz("America/New_York");
    const courseEndTime = moment(courseData.endDate.toDate()).tz("America/New_York");

    const datesToAdd = getDateRange(startTime, courseEndTime);

    const now = moment();

    const batch = db.batch();

    datesToAdd.forEach((sessionStart) => {
        // Do not add sessions before today or course start
        const checkStart = sessionStart.clone().add(endTime.diff(startTime)).isBefore(now);
        if (checkStart || sessionStart.isBefore(courseStartTime)){ // add to get session end time
            return;
        }

        const sessionEnd = moment(sessionStart);
        sessionEnd.add(duration);

        // Session Add Logic (This is yucky and should be refactored...)
        if (sessionSeries.modality === 'virtual') {

            let virtualProperty = {}

            if (typeof sessionSeries.useTALink !== 'undefined') {
                virtualProperty = {
                    useTALink: sessionSeries.useTALink
                }
            }

            const derivedSession: Omit<FireVirtualSession, 'sessionId'> = {
                ...virtualProperty,
                modality: sessionSeries.modality,
                sessionSeriesId,
                courseId: sessionSeries.courseId,
                endTime: firestore.Timestamp.fromDate(sessionEnd.toDate()),
                startTime: firestore.Timestamp.fromDate(sessionStart.toDate()),
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
                endTime: firestore.Timestamp.fromDate(sessionEnd.toDate()),
                startTime: firestore.Timestamp.fromDate(sessionStart.toDate()),
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
            let hybridProperty = {}

            if (sessionSeries.modality === 'hybrid' && typeof sessionSeries.useTALink !== 'undefined') {
                hybridProperty = {
                    useTALink: sessionSeries.useTALink
                }
            }


            const derivedSession: Omit<FireInPersonSession | FireHybridSession, 'sessionId'> = {
                ...hybridProperty,
                sessionSeriesId,
                modality: sessionSeries.modality,
                building: sessionSeries.building,
                courseId: sessionSeries.courseId,
                endTime: firestore.Timestamp.fromDate(sessionEnd.toDate()),
                room: sessionSeries.room,
                startTime: firestore.Timestamp.fromDate(sessionStart.toDate()),
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
    })
    await batch.commit();
};

export const updateSeries = async (
    db: firebase.firestore.Firestore,
    sessionSeriesId: string,
    sessionSeries: FireSessionSeriesDefinition
): Promise<void> => {
    const adjustedStartTime = moment(sessionSeries.startTime.toDate()).tz("America/New_York");
    const adjustedEndTime = moment(sessionSeries.endTime.toDate()).tz("America/New_York");

    const querySnapshot = await db
        .collection('sessions')
        .where('sessionSeriesId', '==', sessionSeriesId)
        .get();
    const batch = db.batch();
    querySnapshot.forEach((sessionDocument) => {
        const sessionId = sessionDocument.id;
        const oldSession = sessionDocument.data() as Omit<FireSession, 'sessionId'>;

        // Uses the same dates as the old session, but sets the minutes, hours and day of week
        // to the updated session information

        const newStartTime = moment(oldSession.startTime.toDate()).tz("America/New_York");
        syncTimes(newStartTime, adjustedStartTime);

        const newEndTime = moment(oldSession.endTime.toDate()).tz("America/New_York");
        syncTimes(newEndTime, adjustedEndTime);

        const startTime = firestore.Timestamp.fromDate(
            newStartTime.toDate()
        );
        const endTime = firestore.Timestamp.fromDate(
            newEndTime.toDate()
        );

        if (sessionSeries.modality === 'virtual') {

            let virtualProperty = {}

            if (typeof sessionSeries.useTALink !== 'undefined') {
                virtualProperty = {
                    useTALink: sessionSeries.useTALink
                }
            }

            const newSession: Omit<FireVirtualSession, 'sessionId'> = {
                ...virtualProperty,
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

            let hybridProperty = {}

            if (sessionSeries.modality === 'hybrid' && typeof sessionSeries.useTALink !== 'undefined') {
                hybridProperty = {
                    useTALink: sessionSeries.useTALink
                }
            }

            const newSession: Omit<FireHybridSession | FireInPersonSession, 'sessionId'> = {
                ...hybridProperty,
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