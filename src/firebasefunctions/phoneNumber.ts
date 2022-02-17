import { firestore } from '../firebase';

export const updatePhoneData = (
    userId : string | undefined,
    phoneData : Partial<FireUser>
) => {
    return firestore.collection('users').doc(userId).update(phoneData);
}