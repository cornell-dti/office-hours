import firebase from "firebase/compat/app"

const firestore = firebase.firestore();

export const updateCourses = (
    userId: string,
    userUpdate: Partial<FireUser>
): Promise<void> => {
    return firestore.collection('users').doc(userId).update(userUpdate)
};