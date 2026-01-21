import firebase from 'firebase/compat/app';
import {User} from 'firebase/auth';
import "firebase/compat/auth";


const auth = firebase.auth;

type FireUser = {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    photoUrl: string;
    courses: string[];
    roles: { [key: string]: boolean };
    phoneNumber: string;
    textNotifsEnabled: boolean;
};
export const userUpload = async (user: User | null, db: firebase.firestore.Firestore) => {
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
        if (uid && email && displayName && photoUrl && firstName && lastName) {
            const firstNameDefined = firstName || "";
            try {
                await db.runTransaction(async (transaction) => {
                    const userDocumentReference = db.collection('users').doc(uid);
                    const userDocument = await transaction.get(userDocumentReference);
                    if (userDocument.exists) {
                        const partialUserDocument: Partial<FireUser> = {
                            email,
                            firstName: firstNameDefined,
                            lastName,
                            photoUrl,
                        };
                        transaction.update(userDocumentReference, partialUserDocument);
                    } else {
                        const fullUserDocument: Omit<FireUser, 'userId'> = {
                            email,
                            firstName: firstNameDefined,
                            lastName,
                            photoUrl,
                            courses: [],
                            roles: {},
                            phoneNumber: "Dummy Number",
                            textNotifsEnabled: false,
                        };
                        transaction.set(userDocumentReference, fullUserDocument);
                    }
                });
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Unable to upload user:', error);
            }
        }
    }
};

export const logOut = () => {
    auth()
        .signOut()
        .then(() => {
            // eslint-disable-next-line no-console
            console.log("User signed out successfully.");
        })
        .catch((error: any) => {
            // eslint-disable-next-line no-console
            console.error("Error signing out:", error);
        });
};