import firebase from 'firebase/compat/app';
// import { firestore } from '../firebase';

const firestore = firebase.firestore()

export const addSession = (session: Omit<FireSession, 'sessionId'>) => {
    return firestore.collection('sessions').add(session).then(() => { });
}

export const updateSession = (oldSession: FireSession, newSession: Omit<FireSession, 'sessionId'>) => {
    return firestore.collection('sessions').doc(oldSession.sessionId).update(newSession);
}

export const pauseSession = (oldSession: FireSession, isPaused: boolean) => {
    const newSession: FireSession = {
        ...oldSession,
        isPaused,
    }
    return firestore.collection('sessions').doc(oldSession.sessionId).update(newSession)
}

export const deleteSession = (sessionId: string) => {
    firestore.collection('sessions').doc(sessionId).delete();
}

export const getUsersFromSessions = async (sessions: FireSession[]): Promise<FireUser[]> => {
    const taSet = new Set<string>();
    sessions.forEach(session => session.tas.forEach(ta => taSet.add(ta)));
    const userDocuments = await Promise.all(Array.from(taSet).map(id => firestore.collection('users').doc(id).get()));
    return userDocuments.map(document => ({
        userId: document.id,
        ...(document.data() as Omit<FireUser, 'userId'>)
    }));
}

export const addTaAnnouncement = (
    oldSession: FireSession,
    user: FireUser,
    announcement: string) => {
    const taAnnouncement: TaAnnouncement = {
        ta: user,
        announcement,
        uploadTime: firebase.firestore.Timestamp.now()
    };

    const newSession: FireSession = {
        ...oldSession,
        taAnnouncements:
            oldSession.taAnnouncements
                ? [taAnnouncement, ...oldSession.taAnnouncements]
                : [taAnnouncement]
    }
    firestore.collection('sessions').doc(oldSession.sessionId).update(newSession);
}

export const deleteTaAnnouncement = (
    oldSession: FireSession,
    user: FireUser,
    announcement: string,
    uploadTime: FireTimestamp,
) => {
    const newTaAnnouncements = oldSession.taAnnouncements?.filter(
        a => !((a.ta.userId === user.userId) && (a.announcement === announcement) && (a.uploadTime === uploadTime)));
    const newSession: FireSession = {
        ...oldSession,
        taAnnouncements: newTaAnnouncements
    }
    firestore.collection('sessions').doc(oldSession.sessionId).update(newSession);
}

/**
 * Fetches number of assigned questions in the session from the question collections
 * and returns the ratio of UNIQUE students per TA
 *
 * @remarks
 * This function reads the questions collection and calculates the ratio of students per TA.
 * This will be used for the TA block component
 *
 * @param session - A FireSession object that represents the session.
 * @returns A number that represents the ratio of students per TA.
 */
export const getNumberOfStudentsPerTA = async (
    session: FireSession
) => {
    // Get the start time of the session
    const startTime = session.startTime.toDate();
    // Get the current time
    const now = new Date();
    // Get the number of TAs in the session
    const numberOfTAs = session.tas.length;
    // If there are no TAs return 0 to avoid division by 0
    if (numberOfTAs === 0) {
        return 0;
    }
    // If the session has not started return default value which is number of TAs
    // This indicates that we will only start tracking number of students per TA once the session has started
    if (now < startTime) {
        return numberOfTAs;
    }
    // Get the session ID
    const sessionId = session.sessionId;
    // Get the reference to the question collection but only containing questions from this specific session and are assigned to a TA
    const questionsRef = firestore
        .collection("questions")
        .where("sessionId", "==", sessionId)
        .where("status", "==", "assigned");
    
    // Create a set to store unique students (same student may ask multiple questions)
    // We are using number of UNIQUE students as metric rather than just the total number of questions without accounting for their askers
    const uniqueStudents = new Set<string>();

    const snapshot = await questionsRef.get();
    if (snapshot.empty) {
        return 0;
    }
    // Iterate through the question documents and add the UNIQUE student ID to the set
    snapshot.forEach((doc) => {
        const data = doc.data();
        if (!uniqueStudents.has(data.askerId)) {
            uniqueStudents.add(data.askerId);
        }
    });
    return uniqueStudents.size / numberOfTAs;
}   