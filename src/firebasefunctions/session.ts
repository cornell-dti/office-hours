import { doc, addDoc, updateDoc, deleteDoc, getDoc, collection, Timestamp} from 'firebase/firestore';
import { firestore } from '../firebase';

export const addSession = (session: Omit<FireSession, 'sessionId'>) => {
    return addDoc(collection(firestore, 'sessions'), session).then(() => { });
}

export const updateSession = (oldSession: FireSession, newSession: Omit<FireSession, 'sessionId'>) => {
    return updateDoc(doc(firestore, 'sessions', oldSession.sessionId), newSession);
}

export const pauseSession = (oldSession: FireSession, isPaused: boolean) => {
    return updateDoc(doc(firestore, 'sessions', oldSession.sessionId), {isPaused});
}

export const deleteSession = (sessionId: string) => {
    deleteDoc(doc(firestore, 'sessions', sessionId));
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
    updateDoc(doc(firestore, 'sessions', oldSession.sessionId), {
        taAnnouncements:
        oldSession.taAnnouncements
            ? [taAnnouncement, ...oldSession.taAnnouncements]
            : [taAnnouncement]  
    });
}

export const deleteTaAnnouncement = (
    oldSession: FireSession,
    user: FireUser,
    announcement: string,
    uploadTime: FireTimestamp,
) => {
    const newTaAnnouncements = oldSession.taAnnouncements?.filter(
        a => !((a.ta.userId === user.userId) && (a.announcement === announcement) && (a.uploadTime === uploadTime)));
    updateDoc(doc(firestore, 'sessions', oldSession.sessionId), {taAnnouncements: newTaAnnouncements});
}