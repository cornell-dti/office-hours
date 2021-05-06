import firebase from "firebase";

export const getObjectsOnce = async <T> (
    query: firebase.firestore.Query,
    idField: string | null = null
): Promise<T[]> => {
    const result: T[] = [];
    const querySnapshots = await query.get();
    querySnapshots.forEach((snapshot) => {
        const data = { ...snapshot.data()};
        if (idField !== null){
            data[idField] = snapshot.id;
        }
        result.push(data as T);
    });
    return result;
}

export const getUsersOnce = async (
    db: firebase.firestore.Firestore
): Promise<FireUser[]> => {
    const query = db.collection('users');
    return getObjectsOnce<FireUser>(query, 'userId');
}

export const getCoursesOnce = async (
    db: firebase.firestore.Firestore
): Promise<FireCourse[]> => {
    const query = db.collection('courses');
    return getObjectsOnce<FireCourse>(query, 'courseId');
}

export const getTagsOnce = async (
    db: firebase.firestore.Firestore
): Promise<FireTag[]> => {
    const query = db.collection('tags');
    return getObjectsOnce<FireTag>(query, 'tagId');
}

export const getPendingUsersOnce = async (
    db: firebase.firestore.Firestore
): Promise<FirePendingUser[]> => {
    const query = db.collection('pendingUsers');
    return getObjectsOnce<FirePendingUser>(query, 'email');
}

export const getQuestionsOnce = async (
    db: firebase.firestore.Firestore
): Promise<FireQuestion[]> => {
    const query = db.collection('questions');
    return getObjectsOnce<FireQuestion>(query, 'questionId');
}

export const getQuestionSlotsOnce = async (
    db: firebase.firestore.Firestore
): Promise<FireQuestionSlot[]> => {
    const query = db.collection('questionSlots');
    return getObjectsOnce<FireQuestionSlot>(query, 'questionId');
}

export const getSessionsOnce = async (
    db: firebase.firestore.Firestore
): Promise<FireSession[]> => {
    const query = db.collection('sessions');
    return getObjectsOnce<FireSession>(query, 'sessionId');
}

