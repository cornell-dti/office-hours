import { firestore } from '../firebase';

export const addSession = (session: Omit<FireSession, 'sessionId'>) => {
    return firestore.collection('sessions').add(session).then(() => {});
}

export const updateSession = (oldSession: FireSession, newSession: Omit<FireSession, 'sessionId'>) => {
    return firestore.collection('sessions').doc(oldSession.sessionId).update(newSession);
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