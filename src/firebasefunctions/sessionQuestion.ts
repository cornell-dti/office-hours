import firebase from 'firebase/app';

export const updateVirtualLocation = (
    db: firebase.firestore.Firestore,
    user: FireUser,
    session: FireSession,
    virtualLocation: string): Promise<void> => {
    return db.doc(`/sessions/${session.sessionId}/profiles/${user.userId}`).set({
        virtualLocation
    }, {
        merge: true
    }).then(() => { })
};

export const addQuestion = (
    user: firebase.User | null,
    session: FireSession,
    db: firebase.firestore.Firestore,
    location: string,
    selectedPrimary: FireTag | undefined,
    selectedSecondary: FireTag | undefined,
    question: string,
    isVirtual: boolean
): boolean => {
    if (user != null) {
        const batch = db.batch();
        const questionId = db.collection('questions').doc().id;
        const newQuestionSlot: Omit<FireQuestionSlot, 'questionId'> = {
            askerId: user.uid,
            sessionId: session.sessionId,
            status: 'unresolved',
            timeEntered: firebase.firestore.Timestamp.now()
        };

        const addVirtual = session.modality === 'hybrid' ?
            { isVirtual } : {};

        const finalLocation = location.length === 0 ? {} : { location };
        const upvotedUsers = session.modality === "review" ? { upvotedUsers: [user.uid] } : {}

        const newQuestion: Omit<FireOHQuestion, 'questionId'> = {
            ...newQuestionSlot,
            ...finalLocation,
            ...upvotedUsers,
            ...addVirtual,
            answererId: '',
            content: question,
            primaryTag: selectedPrimary != null ? selectedPrimary.tagId : '',
            secondaryTag: selectedSecondary != null ? selectedSecondary.tagId : '',
            wasNotified: false,
            position: session.totalQuestions - session.assignedQuestions + 1,

        };
        batch.set(db.collection('questionSlots').doc(questionId), newQuestionSlot);
        batch.set(db.collection('questions').doc(questionId), newQuestion);
        batch.commit();

        return true
    }

    return false
}

export const updateQuestion = (
    user: firebase.User | null,
    session: FireSession,
    db: firebase.firestore.Firestore,
    location: string,
    selectedPrimary: FireTag | undefined,
    selectedSecondary: FireTag | undefined,
    question: string,
    isVirtual: boolean
): boolean => {
    if (user != null) {
        const batch = db.batch();
        const questionId = db.collection('questions').doc().id;
        const newQuestionSlot: Omit<FireQuestionSlot, 'questionId'> = {
            askerId: user.uid,
            sessionId: session.sessionId,
            status: 'unresolved',
            timeEntered: firebase.firestore.Timestamp.now()
        };

        const addVirtual = session.modality === 'hybrid' ?
            { isVirtual } : {};

        const finalLocation = location.length === 0 ? {} : { location };
        const upvotedUsers = session.modality === "review" ? { upvotedUsers: [user.uid] } : {}

        const newQuestion: Omit<FireOHQuestion, 'questionId'> = {
            ...newQuestionSlot,
            ...finalLocation,
            ...upvotedUsers,
            ...addVirtual,
            answererId: '',
            content: question,
            primaryTag: selectedPrimary != null ? selectedPrimary.tagId : '',
            secondaryTag: selectedSecondary != null ? selectedSecondary.tagId : '',
            wasNotified: false,
            position: session.totalQuestions - session.assignedQuestions + 1,

        };
        batch.set(db.collection('questionSlots').doc(questionId), newQuestionSlot);
        batch.set(db.collection('questions').doc(questionId), newQuestion);
        batch.commit();

        return true
    }

    return false
}
export const markStudentNoShow = (
    db: firebase.firestore.Firestore,
    question: FireOHQuestion
) => {
    const batch = db.batch();
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'no-show' };
    const questionUpdate: Partial<FireQuestion> = slotUpdate;
    batch.update(db.doc(`questionSlots/${question.questionId}`), slotUpdate);
    batch.update(db.doc(`questions/${question.questionId}`), questionUpdate);
    batch.commit();
}


export const markQuestionDone = (
    db: firebase.firestore.Firestore,
    question: FireOHQuestion
) => {
    const batch = db.batch();
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'resolved' };
    const questionUpdate: Partial<FireOHQuestion> = {
        status: 'resolved',
        timeAddressed: firebase.firestore.Timestamp.now()
    };
    batch.update(db.doc(`questionSlots/${question.questionId}`), slotUpdate);
    batch.update(db.doc(`questions/${question.questionId}`), questionUpdate);
    batch.commit();
}


export const markQuestionDontKnow = (
    db: firebase.firestore.Firestore,
    question: FireOHQuestion
) => {
    const batch = db.batch();
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'unresolved' };
    const questionUpdate: Partial<FireQuestion> = { status: 'unresolved', answererId: '' };
    batch.update(db.doc(`questionSlots/${question.questionId}`), slotUpdate);
    batch.update(db.doc(`questions/${question.questionId}`), questionUpdate);
    batch.commit();
}


export const retractStudentQuestion = (
    db: firebase.firestore.Firestore,
    question: FireOHQuestion
) => {
    const batch = db.batch();
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'retracted' };
    const questionUpdate: Partial<FireQuestion> = slotUpdate;
    batch.update(db.doc(`questionSlots/${question.questionId}`), slotUpdate);
    batch.update(db.doc(`questions/${question.questionId}`), questionUpdate);
    batch.commit();
}


export const updateComment = (
    db: firebase.firestore.Firestore,
    question: FireOHQuestion,
    newComment: string,
    isTA: boolean
) => {
    let update: Partial<FireOHQuestion>
    if (isTA) {
        update = { taComment: newComment };
    } else {
        update = { studentComment: newComment };
    }
    db.doc(`questions/${question.questionId}`).update(update);
}


export const assignQuestionToTA = (
    db: firebase.firestore.Firestore,
    question: FireOHQuestion,
    virtualLocation: string | undefined,
    myUserId: string
) => {


    const batch = db.batch();
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'assigned' };
    const questionUpdate: Partial<FireOHQuestion> = {
        status: 'assigned',
        answererId: myUserId,
        timeAssigned: firebase.firestore.Timestamp.now(),
        ...(virtualLocation ? { answererLocation: virtualLocation } : {})
    };
    batch.update(db.doc(`questionSlots/${question.questionId}`), slotUpdate);
    batch.update(db.doc(`questions/${question.questionId}`), questionUpdate);
    batch.commit();
}

export const removeQuestionbyID = (
    db: firebase.firestore.Firestore,
    removeQuestionId: string | undefined
) => {
    if (removeQuestionId !== undefined) {
        const batch = db.batch();
        const slotUpdate: Partial<FireQuestionSlot> = { status: 'retracted' };
        const questionUpdate: Partial<FireQuestion> = slotUpdate;
        batch.update(db.doc(`questionSlots/${removeQuestionId}`), slotUpdate);
        batch.update(db.doc(`questions/${removeQuestionId}`), questionUpdate);
        batch.commit();
    }
}

export const updateQuestion = (
    db: firebase.firestore.Firestore,
    virtualLocation: string,
    questions: readonly FireQuestion[],
    user: FireUser

) => {
    const batch = db.batch();

    const questionUpdate: Partial<FireOHQuestion> = { answererLocation: virtualLocation };
    questions.forEach((q) => {
        if (q.answererId === user.userId && q.status === 'assigned') {
            batch.update(db.doc(`questions/${q.questionId}`), questionUpdate);
        }
    });

    batch.commit();
}
