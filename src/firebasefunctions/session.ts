import { firestore } from '../firebase';
import { doc, addDoc, updateDoc, deleteDoc, getDoc, collection, Timestamp} from 'firebase/firestore';

export const addSession = (session: Omit<FireSession, 'sessionId'>) => {
    return addDoc(collection(firestore, 'sessions'), session).then(() => { });
}

export const updateSession = (oldSession: FireSession, newSession: Omit<FireSession, 'sessionId'>) => {
    return updateDoc(doc(firestore, 'sessions', oldSession.sessionId), newSession);
}

export const pauseSession = (oldSession: FireSession, isPaused: boolean) => {
    // const newSession: FireSession = {
    //     ...oldSession,
    //     isPaused,
    // }
    return updateDoc(doc(firestore, 'sessions', oldSession.sessionId), {isPaused});
    // return firestore.collection('sessions').doc(oldSession.sessionId).update(newSession)
}

export const deleteSession = (sessionId: string) => {
    //return this??
    deleteDoc(doc(firestore, 'sessions', sessionId));
    //firestore.collection('sessions').doc(sessionId).delete();
}

export const getUsersFromSessions = async (sessions: FireSession[]): Promise<FireUser[]> => {
    const taSet = new Set<string>();
    sessions.forEach(session => session.tas.forEach(ta => taSet.add(ta)));
    const userDocuments = await Promise.all(Array.from(taSet).map(id => getDoc(doc(firestore, 'users', id))));
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
        uploadTime: Timestamp.now()
    };
    // const newSession: FireSession = {
    //     ...oldSession,
    //     taAnnouncemements:
    //         oldSession.taAnnouncemements
    //             ? [taAnnouncement, ...oldSession.taAnnouncemements]
    //             : [taAnnouncement]
    // }
    updateDoc(doc(firestore, 'sessions', oldSession.sessionId), {
        taAnnouncemements:
        oldSession.taAnnouncemements
            ? [taAnnouncement, ...oldSession.taAnnouncemements]
            : [taAnnouncement]  
    });
}

export const deleteTaAnnouncement = (
    oldSession: FireSession,
    user: FireUser,
    announcement: string,
    uploadTime: FireTimestamp,
) => {
    const newTaAnnouncements = oldSession.taAnnouncemements?.filter(
        a => !((a.ta.userId === user.userId) && (a.announcement === announcement) && (a.uploadTime === uploadTime)));
    // const newSession: FireSession = {
    //     ...oldSession,
    //     taAnnouncemements: newTaAnnouncements
    // }
    updateDoc(doc(firestore, 'sessions', oldSession.sessionId), {taAnnouncements: newTaAnnouncements});
}