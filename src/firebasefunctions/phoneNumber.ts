import { firestore } from '../firebase';

export const updatePhoneNum = (
    userId: string | undefined,
    phoneNumber: Partial<FireUser>
) => {
    if (userId){
        return firestore.collection('users').doc(userId).update(phoneNumber);
    } 
    /* eslint-disable no-console */
    console.log('User is undefined while updating phone number');
    return Promise.resolve();
    
}

export const updateTextPrompted = (
    userId: string | undefined
) => {
    if (userId) {
        return firestore.collection('users').doc(userId).update({textPrompted: true});
    } 
    /* eslint-disable no-console */
    console.log('User is undefined while updating text prompted');
    return Promise.resolve();
    
}