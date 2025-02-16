import { firestore } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const updatePhoneNum = (
    userId: string | undefined,
    phoneNumber: Partial<FireUser>
) => {
    if (userId){
        return updateDoc(doc(firestore, 'users', userId), phoneNumber);
    } else {
        /* eslint-disable no-console */
        console.log('User is undefined while updating phone number');
        return Promise.resolve();
    }
}

export const updateTextPrompted = (
    userId: string | undefined
) => {
    if (userId) {
        return updateDoc(doc(firestore, 'users', userId), {textPrompted: true});
    } else {
        /* eslint-disable no-console */
        console.log('User is undefined while updating text prompted');
        return Promise.resolve();
    }
}