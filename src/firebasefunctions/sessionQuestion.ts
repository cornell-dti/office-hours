import { 
    doc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    Timestamp, 
    writeBatch, 
    getDoc, 
    collection, 
    onSnapshot 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { firestore } from '../firebase';

export const updateVirtualLocation = (
    user: FireUser,
    session: FireSession,
    virtualLocation: string): Promise<void> => {
    const sessionProfileRef = doc(firestore, `/sessions/${session.sessionId}/profiles/${user.userId}`);
    return setDoc(sessionProfileRef, { virtualLocation }, { merge: true });
};

export const addQuestion = (
    user: User | null,
    session: FireSession,
    location: string,
    selectedPrimary: FireTag | undefined,
    selectedSecondary: FireTag | undefined,
    question: string,
    isVirtual: boolean
): boolean => {
    if (user != null) {
        const batch = writeBatch(firestore);
        const questionId = doc(collection(firestore, 'questions')).id;
        const newQuestionSlot: Omit<FireQuestionSlot, 'questionId'> = {
            askerId: user.uid,
            sessionId: session.sessionId,
            status: 'unresolved',
            timeEntered: Timestamp.now()
        };

        const addVirtual = session.modality === 'hybrid' ? { isVirtual } : {};
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
        batch.set(doc(firestore, 'questionSlots', questionId), newQuestionSlot);
        batch.set(doc(firestore, 'questions', questionId), newQuestion);
        batch.commit();

        return true
    }

    return false
}

export const markStudentNoShow = (
    question: FireOHQuestion
) => {
    const batch = writeBatch(firestore);
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'no-show' };
    const questionUpdate: Partial<FireQuestion> = slotUpdate;
    batch.update(doc(firestore, `questionSlots/${question.questionId}`), slotUpdate);
    batch.update(doc(firestore, `questions/${question.questionId}`), questionUpdate);
    batch.commit();
}

export const markQuestionDone = (
    question: FireOHQuestion
) => {
    const batch = writeBatch(firestore);
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'resolved' };
    const questionUpdate: Partial<FireOHQuestion> = {
        status: 'resolved',
        timeAddressed: Timestamp.now()
    };
    batch.update(doc(firestore, `questionSlots/${question.questionId}`), slotUpdate);
    batch.update(doc(firestore, `questions/${question.questionId}`), questionUpdate);
    batch.commit();
}

export const markQuestionDontKnow = (
    question: FireOHQuestion
) => {
    const batch = writeBatch(firestore);
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'unresolved' };
    const questionUpdate: Partial<FireQuestion> = { status: 'unresolved', answererId: '' };
    batch.update(doc(firestore, `questionSlots/${question.questionId}`), slotUpdate);
    batch.update(doc(firestore, `questions/${question.questionId}`), questionUpdate);
    batch.commit();
}

export const retractStudentQuestion = (
    question: FireOHQuestion
) => {
    const batch = writeBatch(firestore);
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'retracted' };
    const questionUpdate: Partial<FireQuestion> = slotUpdate;
    batch.update(doc(firestore, `questionSlots/${question.questionId}`), slotUpdate);
    batch.update(doc(firestore, `questions/${question.questionId}`), questionUpdate);
    batch.commit();
}

export const updateComment = (
    question: FireOHQuestion,
    newComment: string,
    isTA: boolean
) => {
    const update: Partial<FireOHQuestion> = isTA ? { taComment: newComment } : { studentComment: newComment };
    updateDoc(doc(firestore, `questions/${question.questionId}`), update);
}

export const clearIndicator = (question: FireQuestion, ta: boolean) => {
    const update: Partial<FireQuestion> = ta ? { taNew: false } : { studentNew: false };
    updateDoc(doc(firestore, `questions/${question.questionId}`), update);
}

export const assignQuestionToTA = (
    question: FireOHQuestion,
    virtualLocation: string | undefined,
    myUserId: string
) => {
    const batch = writeBatch(firestore);
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'assigned' };
    const questionUpdate: Partial<FireOHQuestion> = {
        status: 'assigned',
        answererId: myUserId,
        timeAssigned: Timestamp.now(),
        ...(virtualLocation ? { answererLocation: virtualLocation } : {})
    };
    batch.update(doc(firestore, `questionSlots/${question.questionId}`), slotUpdate);
    batch.update(doc(firestore, `questions/${question.questionId}`), questionUpdate);
    batch.commit();
}

export const removeQuestionbyID = (
    removeQuestionId: string | undefined
) => {
    if (removeQuestionId !== undefined) {
        const batch = writeBatch(firestore);
        const slotUpdate: Partial<FireQuestionSlot> = { status: 'retracted' };
        const questionUpdate: Partial<FireQuestion> = slotUpdate;
        batch.update(doc(firestore, `questionSlots/${removeQuestionId}`), slotUpdate);
        batch.update(doc(firestore, `questions/${removeQuestionId}`), questionUpdate);
        batch.commit();
    }
}

export const updateQuestion = (
    virtualLocation: string,
    questions: readonly FireQuestion[],
    user: FireUser
) => {
    const batch = writeBatch(firestore);
    const questionUpdate: Partial<FireOHQuestion> = { answererLocation: virtualLocation };
    questions.forEach((q) => {
        if (q.answererId === user.userId && q.status === 'assigned') {
            batch.update(doc(firestore, `questions/${q.questionId}`), questionUpdate);
        }
    });
    batch.commit();
}

export const addComment = (content: string, commenterId: string, questionId: string, isTA: boolean,
    askerId: string, answererId: string) => {
    const timePosted = Timestamp.now();
    const commentId = doc(collection(firestore, `questions/${questionId}/comments`)).id;
    updateDoc(doc(firestore, `questions/${questionId}`), isTA ? { studentNew: true } : { taNew: true });
    const newComment: FireComment = {
        content,
        commenterId,
        timePosted,
        isTA,
        commentId,
        askerId,
        answererId,
    }
    const batch = writeBatch(firestore);
    setDoc(doc(firestore, `questions/${questionId}/comments`, commentId), newComment);
    batch.commit();
}

export const deleteComment = (commentId: string, questionId: string) => {
    const batch = writeBatch(firestore);
    deleteDoc(doc(firestore, `questions/${questionId}/comments`, commentId));
    batch.commit();
}

export const updateCurrentComment = (commentId: string, questionId: string, newContent: string) => {
    const batch = writeBatch(firestore);
    updateDoc(doc(firestore, `questions/${questionId}/comments`, commentId), { content: newContent });
    batch.commit();
}

export const getComments = (questionId: string, setComments: ((comments: FireComment[]) => void)): (() => void) => {
    const unsubscribe = onSnapshot(collection(firestore, `questions/${questionId}/comments`), (commentData) => {
        const comments: FireComment[] = [];
        commentData.forEach((comment) => {
            comments.push(comment.data() as FireComment);
        });
        setComments(comments);
    });
    return () => unsubscribe();
}

export const submitFeedback = (removedQuestionId: string | undefined, relevantCourse: FireCourse, session: string) => 
    (rating?: number, feedback?: string) => {
        const feedbackRecord = {
            session,
            questionId: removedQuestionId,
            rating,
            writtenFeedback: feedback,
        };
        const courseRef = doc(firestore, "courses", relevantCourse.courseId);
        getDoc(courseRef).then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const existingFeedbackList = docSnapshot.data()?.feedbackList || [];
                existingFeedbackList.push(feedbackRecord);
                return updateDoc(courseRef, { feedbackList: existingFeedbackList });
            } 
            return Promise.resolve();
        });
    };
