import * as firebase from 'firebase';
import { firestore, auth } from '../firebase';

export function addQuestion(
    sessionId: string, 
    modality: FireSessionModality,
    question: string,
    tagId: string,
    secondaryTagId: string,
    currentLocation?: string,
): void {
    if (auth.currentUser != null) {
        const batch = firestore.batch();
        const questionId = firestore.collection('questions').doc().id;
        const newQuestionSlot: Omit<FireQuestionSlot, 'questionId'> = {
            askerId: auth.currentUser.uid,
            sessionId,
            status: 'unresolved',
            timeEntered: firebase.firestore.Timestamp.now()
        };

        const location = modality === 'virtual' ? {} : { location: currentLocation };

        const newQuestion: Omit<FireQuestion, 'questionId'> = {
            ...newQuestionSlot,
            ...location,
            answererId: '',
            content: question,
            primaryTag: tagId,
            secondaryTag: secondaryTagId
        };
        batch.set(firestore.collection('questionSlots').doc(questionId), newQuestionSlot);
        batch.set(firestore.collection('questions').doc(questionId), newQuestion);
        batch.commit();
    }
}

export const retractQuestion = (questionId: string): void => {
    const batch = firestore.batch();
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'retracted' };
    const questionUpdate: Partial<FireQuestion> = slotUpdate;
    batch.update(firestore.doc(`questionSlots/${questionId}`), slotUpdate);
    batch.update(firestore.doc(`questions/${questionId}`), questionUpdate);
    batch.commit();
};

