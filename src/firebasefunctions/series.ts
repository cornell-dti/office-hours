import { 
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    deleteDoc, 
    writeBatch, 
    query, 
    where, 
    getDocs, 
    Timestamp 
} from 'firebase/firestore';
import moment from 'moment-timezone';
import { firestore } from '../firebase';
import { getDateRange, syncTimes } from '../utilities/date';

export const createSeries = async (
    sessionSeries: FireSessionSeriesDefinition
): Promise<void> => {
    const courseDocRef = doc(firestore, 'courses', sessionSeries.courseId);
    const courseDoc = await getDoc(courseDocRef);
    const courseData = courseDoc.data() as FireCourse;

    const sessionSeriesId = doc(collection(firestore, 'sessions')).id;

    const startTime = moment(sessionSeries.startTime.toDate()).tz("America/New_York");
    const endTime = moment(sessionSeries.endTime.toDate()).tz("America/New_York");
    const duration = endTime.diff(startTime);

    const courseStartTime = moment(courseData.startDate.toDate()).tz("America/New_York");
    const courseEndTime = moment(courseData.endDate.toDate()).tz("America/New_York");

    const datesToAdd = getDateRange(startTime, courseEndTime);

    const now = moment();

    const batch = writeBatch(firestore);

    datesToAdd.forEach((sessionStart) => {
        const checkStart = sessionStart.clone().add(duration).isBefore(now);
        if (checkStart || sessionStart.isBefore(courseStartTime)) {
            return;  // Skip adding this session
        }
    
        const sessionEnd = moment(sessionStart).add(duration);
    
        const sessionData = {
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
            isPaused: false,
            ...(sessionSeries.modality === 'hybrid' || sessionSeries.modality === 'virtual') && {
                useTALink: sessionSeries.useTALink ?? false
            },
            ...(sessionSeries.modality === 'review') && {
                link: sessionSeries.link
            }
        };
    
        // Create a new session document reference
        const newSessionRef = doc(collection(firestore, 'sessions'));
        setDoc(newSessionRef, sessionData);
    });
    

    await batch.commit();
};

export const updateSeries = async (
    sessionSeriesId: string,
    sessionSeries: FireSessionSeriesDefinition
): Promise<void> => {
    const adjustedStartTime = moment(sessionSeries.startTime.toDate()).tz("America/New_York");
    const adjustedEndTime = moment(sessionSeries.endTime.toDate()).tz("America/New_York");
    const sessionsQuery = query(collection(firestore, 'sessions'), where('sessionSeriesId', '==', sessionSeriesId));
    const querySnapshot = await getDocs(sessionsQuery);
    const batch = writeBatch(firestore);

    querySnapshot.forEach((sessionDocument) => {
        const oldSession = sessionDocument.data() as FireSession;
        const sessionRef = doc(firestore, 'sessions', sessionDocument.id);

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

        const sessionData = {
            modality: sessionSeries.modality,
            sessionSeriesId,
            courseId: sessionSeries.courseId,
            endTime,
            startTime,
            tas: sessionSeries.tas,
            title: sessionSeries.title,
            totalQuestions: 0,
            assignedQuestions: 0,
            resolvedQuestions: 0,
            totalWaitTime: 0,
            totalResolveTime: 0,
            isPaused: false,
            ...(sessionSeries.modality === 'hybrid' || sessionSeries.modality === 'virtual') && {
                useTALink: sessionSeries.useTALink ?? false
            },
            ...(sessionSeries.modality === 'review') && {
                link: sessionSeries.link
            }
        };

        setDoc(sessionRef, sessionData);
    });

    await batch.commit();
};

export const deleteSeries = async (sessionSeriesId: string): Promise<void> => {
    const sessionsQuery = query(collection(firestore, 'sessions'), where('sessionSeriesId', '==', sessionSeriesId));
    const querySnapshot = await getDocs(sessionsQuery);
    const batch = writeBatch(firestore);

    querySnapshot.docs.forEach((document) => {
        const sessionRef = doc(firestore, 'sessions', document.id);
        deleteDoc(sessionRef);
    });

    await batch.commit();
};
