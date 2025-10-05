import { doc, updateDoc, getDoc, setDoc, collection, 
    writeBatch, Timestamp, Firestore, onSnapshot} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { firestore } from '../firebase';

export const updateVirtualLocation = (
    db: Firestore,
    user: FireUser,
    session: FireSession,
    virtualLocation: string): Promise<void> => {
    const profileRef = doc(db, `sessions/${session.sessionId}/profiles/${user.userId}`);
    return setDoc(profileRef, { virtualLocation }, { merge: true }).then(() => { });
};

export const addQuestion = (
    user: User | null,
    session: FireSession,
    course: FireCourse,
    db: Firestore,
    location: string,
    selectedPrimary: FireTag | undefined,
    selectedSecondary: FireTag | undefined,
    question: string,
    isVirtual: boolean
): boolean => {
    if (user != null) {
        const batch = writeBatch(db);
        const questionId = doc(collection(db,'questions')).id;
        const newQuestionSlot: Omit<FireQuestionSlot, 'questionId'> = {
            askerId: user.uid,
            sessionId: session.sessionId,
            status: 'unresolved',
            timeEntered: Timestamp.now()
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
            courseId:course.courseId,
            content: question,
            primaryTag: selectedPrimary != null ? selectedPrimary.tagId : '',
            secondaryTag: selectedSecondary != null ? selectedSecondary.tagId : '',
            wasNotified: false,
            position: session.totalQuestions - session.assignedQuestions + 1,

        };
        batch.set(doc(collection(db, 'questionSlots'), questionId), newQuestionSlot)
        batch.set(doc(collection(db, 'questions'), questionId), newQuestion);
        batch.commit();

        return true
    }

    return false
}

export const markStudentNoShow = (
    db: Firestore,
    question: FireOHQuestion
) => {
    const batch = writeBatch(db);
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'no-show' };
    const questionUpdate: Partial<FireQuestion> = slotUpdate;
    batch.update(doc(db, `questionSlots/${question.questionId}`), slotUpdate)
    batch.update(doc(db, `questions/${question.questionId}`), questionUpdate);
    batch.commit();
}


export const markQuestionDone = (
    db: Firestore,
    question: FireOHQuestion
) => {
    const batch = writeBatch(db);
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'resolved' };
    const questionUpdate: Partial<FireOHQuestion> = {
        status: 'resolved',
        timeAddressed: Timestamp.now()
    };
    batch.update(doc(db,`questionSlots/${question.questionId}`), slotUpdate);
    batch.update(doc(db,`questions/${question.questionId}`), questionUpdate);
    batch.commit();
}


export const markQuestionDontKnow = (
    db: Firestore,
    question: FireOHQuestion
) => {
    const batch = writeBatch(db);
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'unresolved' };
    const questionUpdate: Partial<FireQuestion> = { status: 'unresolved', answererId: '' };
    batch.update(doc(db,`questionSlots/${question.questionId}`), slotUpdate);
    batch.update(doc(db,`questions/${question.questionId}`), questionUpdate);
    batch.commit();
}


export const retractStudentQuestion = (
    db: Firestore,
    question: FireOHQuestion
) => {
    const batch = writeBatch(db);
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'retracted' };
    const questionUpdate: Partial<FireQuestion> = slotUpdate;
    batch.update(doc(db,`questionSlots/${question.questionId}`), slotUpdate);
    batch.update(doc(db,`questions/${question.questionId}`), questionUpdate);
    batch.commit();
}


export const updateComment = (
    db: Firestore,
    question: FireOHQuestion,
    newComment: string,
    isTA: boolean
) => {
    const update: Partial<FireOHQuestion> = isTA 
        ? { taComment: newComment } 
        : { studentComment: newComment };
    const questionRef = doc(db,`questions/${question.questionId}`);
    
    updateDoc(questionRef, update);
}

export const clearIndicator = (question: FireQuestion, ta: boolean) => {
    const update: Partial<FireQuestion> = ta
        ? { taNew: false } 
        : { studentNew: false };
    const questionRef = doc(firestore,`questions/${question.questionId}`);
    updateDoc(questionRef, update)
}


export const assignQuestionToTA = (
    db: Firestore,
    question: FireOHQuestion,
    virtualLocation: string | undefined,
    myUserId: string
) => {


    const batch = writeBatch(db);
    const slotUpdate: Partial<FireQuestionSlot> = { status: 'assigned' };
    const questionUpdate: Partial<FireOHQuestion> = {
        status: 'assigned',
        answererId: myUserId,
        timeAssigned: Timestamp.now(),
        ...(virtualLocation ? { answererLocation: virtualLocation } : {})
    };
    batch.update(doc(db,`questionSlots/${question.questionId}`), slotUpdate);
    batch.update(doc(db,`questions/${question.questionId}`), questionUpdate);
    batch.commit();
}

export const removeQuestionbyID = (
    db: Firestore,
    removeQuestionId: string | undefined
) => {
    if (removeQuestionId !== undefined) {
        const batch = writeBatch(db);
        const slotUpdate: Partial<FireQuestionSlot> = { status: 'retracted' };
        const questionUpdate: Partial<FireQuestion> = slotUpdate;
        batch.update(doc(db,`questionSlots/${removeQuestionId}`), slotUpdate);
        batch.update(doc(db,`questions/${removeQuestionId}`), questionUpdate);
        batch.commit();
    }
}

export const updateQuestion = (
    db: Firestore,
    virtualLocation: string,
    questions: readonly FireQuestion[],
    user: FireUser

) => {
    const batch = writeBatch(db);
    const questionUpdate: Partial<FireOHQuestion> = { answererLocation: virtualLocation };
    questions.forEach((q) => {
        if (q.answererId === user.userId && q.status === 'assigned') {
            batch.update(doc(db,`questions/${q.questionId}`), questionUpdate);
        }
    });

    batch.commit();
}

export const addComment = (content: string, commenterId: string, questionId: string, isTA: boolean,
    askerId: string, answererId: string) => {
    const timePosted = Timestamp.now();
    const questionRef = doc(firestore, `questions/${questionId}`);
    const commentsRef = collection(questionRef, 'comments');
    const commentId = doc(commentsRef).id;
    updateDoc(questionRef, isTA ? { studentNew: true } : { taNew: true });
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
    batch.set(doc(commentsRef), newComment);
    batch.commit();
}

export const deleteComment = (commentId: string, questionId: string) => {
    const batch = writeBatch(firestore);
    const questionRef = doc(firestore, `questions/${questionId}`);
    const commentsRef = collection(questionRef, 'comments');
    const delCommentRef = doc(commentsRef, commentId);
    batch.delete(delCommentRef);
    batch.commit();
}

export const updateCurrentComment = (commentId: string, questionId: string, newContent: string) => {
    const batch = writeBatch(firestore);
    const questionRef = doc(firestore, `questions/${questionId}`);
    const commentsRef = collection(questionRef, 'comments');
    const curCommentRef = doc(commentsRef, commentId);
    batch.update(curCommentRef, { content: newContent });
    batch.commit();
}

export const getComments = (questionId: string, setComments: ((comments: FireComment[]) => void)): (() => void) => {
    const questionRef = doc(firestore, `questions/${questionId}`);
    const commentsRef = collection(questionRef, 'comments');
    const unsubscribe = onSnapshot(commentsRef, (commentData) => {
        const comments: FireComment[] = [];
        commentData.forEach((comment) => {
            comments.push(comment.data() as FireComment);
        });
        setComments(comments);
    });
    return unsubscribe;
}

export const submitFeedback = (removedQuestionId: string | undefined, relevantCourse: FireCourse, session: string) => 
    (rating?: number, feedback?: string) => {
        
        const feedbackRecord = {
            session,
            questionId: removedQuestionId,
            rating,
            writtenFeedback: feedback,
        };
        const courseRef = doc(firestore, 'courses', relevantCourse.courseId);

        return getDoc(courseRef).then((docu) => {
            if (docu.exists()) {
                const existingFeedbackList = docu.data()?.feedbackList || [];
            
                existingFeedbackList.push(feedbackRecord);

                return updateDoc(courseRef, {
                    feedbackList: existingFeedbackList
                });
            }
            // eslint-disable-next-line no-console
            console.error("Doc doesn't exist"); 
            return Promise.resolve();
        }).catch((error) => {
            // eslint-disable-next-line no-console
            console.error("Error updating feedback:", error);
            return Promise.reject(error);
        });
    
    };
