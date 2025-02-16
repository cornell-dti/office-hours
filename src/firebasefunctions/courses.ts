import { firestore } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const updateCourses = (
    userId: string,
    userUpdate: Partial<FireUser>
): Promise<void> => {
    const userRef = doc(firestore, 'users', userId);
    return updateDoc(userRef, userUpdate);
};