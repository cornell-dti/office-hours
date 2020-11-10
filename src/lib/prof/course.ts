import { firestore } from '../firebase';

export const updateCourseSettings = (courseId: string, charLimit: number, openInterval: number): void => {
    const courseUpdate: Partial<FireCourse> = {
        queueOpenInterval: openInterval,
        charLimit
    };
    firestore.collection('courses').doc(courseId).update(courseUpdate);
};

export const getUsers = async (sessions: FireSession[]): Promise<FireUser[]> => {
    const taSet = new Set<string>();
    sessions.forEach(session => session.tas.forEach(ta => taSet.add(ta)));
    const userDocuments = await Promise.all(Array.from(taSet).map(id => firestore.collection('users').doc(id).get()));
    return userDocuments.map(document => ({
        userId: document.id,
        ...(document.data() as Omit<FireUser, 'userId'>)
    }));
};
