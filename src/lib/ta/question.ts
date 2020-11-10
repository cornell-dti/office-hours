import firebase from 'firebase';

import { firestore as db } from '../firebase';

export const assignQuestion = (
    userId: string,
    questionId: string,
    virtualLocation?: string
): Promise<void> => {
    const batch = db.batch();
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'assigned' };
    const questionUpdate: Partial<FireQuestion> = {
        status: 'assigned',
        answererId: userId,
        timeAssigned: firebase.firestore.Timestamp.now(),
        ...(virtualLocation ? { answererLocation: virtualLocation } : {})
    };
    batch.update(db.doc(`questionSlots/${questionId}`), slotUpdate);
    batch.update(db.doc(`questions/${questionId}`), questionUpdate);

    return batch.commit();
};

export const studentNoShow = (questionId: string): Promise<void> => {
    const batch = db.batch();
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'no-show' };
    const questionUpdate: Partial<FireQuestion> = slotUpdate;
    batch.update(db.doc(`questionSlots/${questionId}`), slotUpdate);
    batch.update(db.doc(`questions/${questionId}`), questionUpdate);

    return batch.commit();
};

export const questionDone = (questionId: string): Promise<void> => {
    const batch = db.batch();
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'resolved' };
    const questionUpdate: Partial<FireQuestion> = {
        status: 'resolved',
        timeAddressed: firebase.firestore.Timestamp.now()
    };
    batch.update(db.doc(`questionSlots/${questionId}`), slotUpdate);
    batch.update(db.doc(`questions/${questionId}`), questionUpdate);

    return batch.commit();
};