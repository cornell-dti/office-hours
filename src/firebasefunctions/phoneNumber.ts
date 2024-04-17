import { doc, updateDoc } from 'firebase/firestore'; 
import { firestore } from '../firebase';

export const updatePhoneNum = (
    userId: string | undefined,
    phoneNumber: Partial<FireUser>  // Assuming FireUser is a defined type with 'phoneNumber' as a property
) => {
    if (!userId) throw new Error("User ID is undefined");
    const userDocRef = doc(firestore, 'users', userId);  // Get a reference to the user document
    return updateDoc(userDocRef, phoneNumber);
}

export const updateTextPrompted = (
    userId: string | undefined
) => {
    if (!userId) throw new Error("User ID is undefined");
    const userDocRef = doc(firestore, 'users', userId);  // Get a reference to the user document
    return updateDoc(userDocRef, { textPrompted: true });
}