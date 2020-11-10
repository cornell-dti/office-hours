import collections from '../collections';
import { firestore } from '../firebase';

export const updateVirtualLocation = (
    user: FireUser,
    session: FireSession,
    virtualLocation: string): Promise<void> => {
    return firestore.doc(`/sessions/${session.sessionId}/profiles/${user.userId}`).set({
        virtualLocation
    }, {
        merge: true
    }).then(() => { })
};

export const updateSessionProfile = async (userId: string, virtualLocation: string) => {
    const questions = await collections.questions().where('answererId', "==", userId).get();
    const batch = firestore.batch();

    const questionUpdate: Partial<FireQuestion> = { answererLocation: virtualLocation };

    questions.forEach((doc) => {
        const q = doc.data();

        if (q.status === 'assigned') {
            batch.update(collections.questions().doc(doc.id), questionUpdate);
        }
    });

    return batch.commit();
};