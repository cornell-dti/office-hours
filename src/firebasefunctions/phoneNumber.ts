import { firestore } from '../firebase';

export const updatePhoneNum = (
    userId: string | undefined,
    phoneNumber: Partial<FireUser>
) => {
    return firestore.collection('users').doc(userId).update(phoneNumber);
}

export const updateTextPrompted = (
    userId: string | undefined
) => {
    return firestore.collection('users').doc(userId).update({textPrompted: true});
}