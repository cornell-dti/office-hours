import { doc, collection, addDoc, updateDoc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '../firebase';

export const addSession = (session: Omit<FireSession, 'sessionId'>) => {
    return addDoc(collection(firestore, 'sessions'), session);
}

export const updateSession = (oldSession: FireSession, newSession: Omit<FireSession, 'sessionId'>) => {
    return updateDoc(doc(firestore, 'sessions', oldSession.sessionId), newSession);
}

export const pauseSession = (oldSession: FireSession, isPaused: boolean) => {
    return updateDoc(doc(firestore, 'sessions', oldSession.sessionId), { ...oldSession, isPaused });
}

export const deleteSession = (sessionId: string) => {
    return deleteDoc(doc(firestore, 'sessions', sessionId));
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
    announcement: string
) => {
    const taAnnouncement: TaAnnouncement = {
        ta: user, 
        announcement,
        uploadTime: Timestamp.now()
    };

    const updates = {
        taAnnouncemements: oldSession.taAnnouncements 
            ? [taAnnouncement, ...oldSession.taAnnouncements] 
            : [taAnnouncement]
    };

    return updateDoc(doc(firestore, 'sessions', oldSession.sessionId), updates);
}


export const deleteTaAnnouncement = (
    oldSession: FireSession,
    user: FireUser,
    announcement: string,
    uploadTime: Timestamp  // Ensure this is using Firestore's Timestamp type
) => {
    const newTaAnnouncements = oldSession.taAnnouncements?.filter(
        (a: TaAnnouncement) =>  // Directly use TaAnnouncement if it's correctly typed
            !(a.ta.userId === user.userId && a.announcement === announcement 
            && a.uploadTime.toMillis() === uploadTime.toMillis())
    );

    return updateDoc(doc(firestore, 'sessions', oldSession.sessionId), { taAnnouncements: newTaAnnouncements });
}