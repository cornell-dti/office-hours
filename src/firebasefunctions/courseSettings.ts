
import firebase from "firebase/compat/app"

const firestore = firebase.firestore();

export const updateSettingsInCourse = (courseId: string, courseUpdate: Partial<FireCourse>) => {
    firestore.collection('courses').doc(courseId).update(courseUpdate);
}