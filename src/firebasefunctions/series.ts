import { doc, getDoc, collection, query, where, Timestamp, Firestore, writeBatch, getDocs} from 'firebase/firestore';
import moment from 'moment-timezone';
import { firestore } from '../firebase';
import { getDateRange, syncTimes } from '../utilities/date';

export const createSeries = async (
    db: Firestore,
    sessionSeries: FireSessionSeriesDefinition
): Promise<void> => {
    const courseDoc = await getDoc(doc(firestore, 'courses', sessionSeries.courseId));
    const courseData = courseDoc.data() as FireCourse;

    const sessionSeriesId = doc(collection(firestore, 'sessions')).id;

    const startTime = moment(sessionSeries.startTime.toDate()).tz("America/New_York");
    const endTime = moment(sessionSeries.endTime.toDate()).tz("America/New_York");
    const duration = endTime.diff(startTime);

    const courseStartTime = moment(courseData.startDate.toDate()).tz("America/New_York");
    const courseEndTime = moment(courseData.endDate.toDate()).tz("America/New_York");

    const datesToAdd = getDateRange(startTime, courseEndTime);

    const now = moment();
    
    const ratio = sessionSeries.studentPerTaRatio;

    const unresolved = sessionSeries.hasUnresolvedQuestion;

    const batch = writeBatch(db);

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
                endTime: Timestamp.fromDate(sessionEnd.toDate()),
                startTime: Timestamp.fromDate(sessionStart.toDate()),
                tas: sessionSeries.tas,
                title: sessionSeries.title,
                totalQuestions: 0,
                assignedQuestions: 0,
                resolvedQuestions: 0,
                totalWaitTime: 0,
                totalResolveTime: 0,
                studentPerTaRatio: ratio,
                hasUnresolvedQuestion: unresolved,
                TALink: sessionSeries.TALink,
                isPaused: false,
            };

            // Generate a new unique ID for each session
            const sessionId = doc(collection(firestore, 'sessions')).id;
            batch.set(doc(db, 'sessions', sessionId), derivedSession);
        } else if (sessionSeries.modality === "review") {
            const derivedSession: Omit<FireReviewSession, 'sessionId'> = {
                modality: sessionSeries.modality,
                sessionSeriesId,
                courseId: sessionSeries.courseId,
                endTime: Timestamp.fromDate(sessionEnd.toDate()),
                startTime: Timestamp.fromDate(sessionStart.toDate()),
                tas: sessionSeries.tas,
                title: sessionSeries.title,
                totalQuestions: 0,
                assignedQuestions: 0,
                resolvedQuestions: 0,
                totalWaitTime: 0,
                totalResolveTime: 0,
                studentPerTaRatio: ratio,
                hasUnresolvedQuestion: unresolved,
                link: sessionSeries.link,
                isPaused: false,
            };
            // Generate a new unique ID for each session
            const sessionId = doc(collection(firestore, 'sessions')).id;
            batch.set(doc(db, 'sessions', sessionId), derivedSession);
        } else {
            let hybridProperty = {}

            if (sessionSeries.modality === 'hybrid' && typeof sessionSeries.useTALink !== 'undefined') {
                hybridProperty = {
                    useTALink: sessionSeries.useTALink,
                    TALink: sessionSeries.TALink
                }
            }

            const derivedSession: Omit<FireInPersonSession | FireHybridSession, 'sessionId'> = {
                ...hybridProperty,
                sessionSeriesId,
                modality: sessionSeries.modality,
                building: sessionSeries.building,
                courseId: sessionSeries.courseId,
                endTime: Timestamp.fromDate(sessionEnd.toDate()),
                room: sessionSeries.room,
                startTime: Timestamp.fromDate(sessionStart.toDate()),
                tas: sessionSeries.tas,
                title: sessionSeries.title,
                totalQuestions: 0,
                assignedQuestions: 0,
                resolvedQuestions: 0,
                totalWaitTime: 0,
                totalResolveTime: 0,
                studentPerTaRatio: ratio,
                hasUnresolvedQuestion: unresolved,
                isPaused: false,
            };
            // Generate a new unique ID for each session
            const sessionId = doc(collection(firestore, 'sessions')).id;
            batch.set(doc(db, 'sessions', sessionId), derivedSession);
        }
    })
    await batch.commit();
};

export const updateSeries = async (
    db: Firestore,
    sessionSeriesId: string,
    sessionSeries: FireSessionSeriesDefinition
): Promise<void> => {
    const adjustedStartTime = moment(sessionSeries.startTime.toDate()).tz("America/New_York");
    const adjustedEndTime = moment(sessionSeries.endTime.toDate()).tz("America/New_York");
    const sessionRef = collection(db, 'sessions');
    const querySnapshot = await getDocs(query(sessionRef, where('sessionSeriesId', '==', sessionSeriesId)));
    const batch = writeBatch(db);
    querySnapshot.forEach((sessionDocument) => {
        const sessionId = sessionDocument.id;
        const oldSession = sessionDocument.data() as Omit<FireSession, 'sessionId'>;

        // Uses the same dates as the old session, but sets the minutes, hours and day of week
        // to the updated session information

        const newStartTime = moment(oldSession.startTime.toDate()).tz("America/New_York");
        syncTimes(newStartTime, adjustedStartTime);

        const newEndTime = moment(oldSession.endTime.toDate()).tz("America/New_York");
        syncTimes(newEndTime, adjustedEndTime);

        const startTime = Timestamp.fromDate(
            newStartTime.toDate()
        );
        const endTime = Timestamp.fromDate(
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
                totalQuestions: oldSession ? oldSession.totalQuestions : 0,
                assignedQuestions: oldSession ? oldSession.assignedQuestions : 0,
                resolvedQuestions: oldSession ? oldSession.resolvedQuestions : 0,
                totalWaitTime: oldSession ? oldSession.totalWaitTime : 0,
                totalResolveTime: oldSession ? oldSession.totalResolveTime : 0,
                studentPerTaRatio: oldSession.studentPerTaRatio,
                hasUnresolvedQuestion: oldSession.hasUnresolvedQuestion,
                TALink: sessionSeries.TALink,
                isPaused: false,
            };
            const sessionDoc = doc(db, 'sessions', sessionId); 
            batch.set(sessionDoc, newSession);
        } else if (sessionSeries.modality === "review") {
            const newSession: Omit<FireReviewSession, 'sessionId'> = {
                sessionSeriesId,
                courseId: sessionSeries.courseId,
                modality: sessionSeries.modality,
                endTime,
                startTime,
                tas: sessionSeries.tas,
                title: sessionSeries.title,
                totalQuestions: oldSession ? oldSession.totalQuestions : 0,
                assignedQuestions: oldSession ? oldSession.assignedQuestions : 0,
                resolvedQuestions: oldSession ? oldSession.resolvedQuestions : 0,
                totalWaitTime: oldSession ? oldSession.totalWaitTime : 0,
                totalResolveTime: oldSession ? oldSession.totalResolveTime : 0,
                studentPerTaRatio: oldSession.studentPerTaRatio,
                hasUnresolvedQuestion: oldSession.hasUnresolvedQuestion,
                link: sessionSeries.link,
                isPaused: false,
            };
            const sessionDoc = doc(db, 'sessions', sessionId); 
            batch.set(sessionDoc, newSession);
        } else {

            let hybridProperty = {}

            if (sessionSeries.modality === 'hybrid' && typeof sessionSeries.useTALink !== 'undefined') {
                hybridProperty = {
                    useTALink: sessionSeries.useTALink,
                    TALink: sessionSeries.TALink
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
                totalQuestions: oldSession ? oldSession.totalQuestions : 0,
                assignedQuestions: oldSession ? oldSession.assignedQuestions : 0,
                resolvedQuestions: oldSession ? oldSession.resolvedQuestions : 0,
                totalWaitTime: oldSession ? oldSession.totalWaitTime : 0,
                totalResolveTime: oldSession ? oldSession.totalResolveTime : 0,
                studentPerTaRatio: oldSession.studentPerTaRatio,
                hasUnresolvedQuestion: oldSession.hasUnresolvedQuestion,
                isPaused: false,
            };
            const sessionDoc = doc(db, 'sessions', sessionId); 
            batch.set(sessionDoc, newSession);
        }

    });
    await batch.commit();
};

export const deleteSeries = async (db: Firestore, sessionSeriesId: string): Promise<void> => {
    const sessionRef = collection(db, 'sessions');
    const querySnapshot = await getDocs(query(sessionRef, where('sessionSeriesId', '==', sessionSeriesId)));
    const batch = writeBatch(db);
    querySnapshot.docs.forEach((document) =>
        batch.delete(doc(db, 'sessions', document.id))
    );
    await batch.commit();
};