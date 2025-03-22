
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

export const updateSettingsInCourse = (courseId: string, courseUpdate: Partial<FireCourse>) => {
    updateDoc(doc(firestore, 'courses', courseId), courseUpdate);
}