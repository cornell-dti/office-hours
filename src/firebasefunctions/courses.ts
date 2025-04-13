import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

export const updateCourses = (
    userId: string,
    userUpdate: Partial<FireUser>
): Promise<void> => {
    const userRef = doc(firestore, 'users', userId);
    return updateDoc(userRef, userUpdate);
};