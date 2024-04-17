import { getAuth, signOut, User } from 'firebase/auth';
import { Firestore, runTransaction, doc } from 'firebase/firestore';

export const userUpload = (user: User | null, db: Firestore) => {
    if (user != null) {
        const uid = user.uid;
        const email = user.email || undefined;
        const displayName = user.displayName || undefined;
        const photoUrl = user.photoURL || undefined;
        let stringSplit = -1;
        let firstName = displayName;
        let lastName = '';
        if (displayName != null) {
            stringSplit = displayName.indexOf(' ');
            if (stringSplit !== -1) {
                firstName = displayName.substring(0, stringSplit);
                lastName = displayName.substring(stringSplit + 1);
            }
        }

        if(uid && email && displayName && photoUrl && firstName && lastName) {
            const firstNameDefined = firstName || "";
            runTransaction(db, async (transaction) => {
                const userDocRef = doc(db, 'users', uid);
                const userDoc = await transaction.get(userDocRef);
                if (userDoc.exists()) {
                    const partialUserDoc: Partial<FireUser> = {
                        email,
                        firstName: firstNameDefined,
                        lastName,
                        photoUrl,
                    };
                    transaction.update(userDocRef, partialUserDoc);
                } else {
                    const fullUserDoc: Omit<FireUser, 'userId'> = {
                        email,
                        firstName: firstNameDefined,
                        lastName,
                        photoUrl,
                        courses: [],
                        roles: {},
                        phoneNumber: "Dummy Number",
                        textNotifsEnabled: false,
                    };
                    transaction.set(userDocRef, fullUserDoc);
                }
            // eslint-disable-next-line no-console
            }).catch(() => console.error('Unable to upload user.'));
        }
    }
};

export const logOut = () => {
    const auth = getAuth();
    signOut(auth)
        .then(() => {
            // Success
        })
        .catch(() => {
            // Fail
        });
};
