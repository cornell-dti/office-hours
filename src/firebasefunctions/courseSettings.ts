
import { firestore } from '../firebase';

export const updateSettingsInCourse = (courseId: string, courseUpdate: Partial<FireCourse>) => {
    firestore.collection('courses').doc(courseId).update(courseUpdate);
}