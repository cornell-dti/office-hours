
import { firestore } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const updateSettingsInCourse = (courseId: string, courseUpdate: Partial<FireCourse>) => {
    updateDoc(doc(firestore, 'courses', courseId), courseUpdate);
}