import { firestore } from '../firebase';

export const updatePhoneNum = (
    userId : string | undefined,
    phoneNumber : Partial<FireUser>
) => {
    return firestore.collection('users').doc(userId).update(phoneNumber);
}