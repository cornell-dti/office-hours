import { firestore } from '../firebase';

export const updateCourses = (
    userId: string,
    userUpdate: Partial<FireUser>
): Promise<void> => {
    return firestore.collection('users').doc(userId).update(userUpdate)
};