import firebase from 'firebase/compat/app';
// import { firestore } from '../firebase';

const firestore = firebase.firestore()

export const addSession = (session: Omit<FireSession, 'sessionId'>) => {
    return firestore.collection('sessions').add(session).then(() => { });
}

export const updateSession = (oldSession: FireSession, newSession: Omit<FireSession, 'sessionId'>) => {
    return firestore.collection('sessions').doc(oldSession.sessionId).set(newSession);
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