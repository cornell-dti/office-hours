import { getAuth, signOut } from "firebase/auth";
import { Firestore, runTransaction, doc, collection, getDoc, setDoc, updateDoc } from "firebase/firestore";

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
export const userUpload = async (user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }, db: Firestore) => {
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
                await runTransaction(db, async (transaction) => {
                    const userDocumentReference = doc(db, 'users', uid);
                    const userDocument = await transaction.get(userDocumentReference);
                    if (userDocument.exists()) {
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
                console.error('Unable to upload user:', error);
            }
        }
    }
};

export const logOut = () => {
    const auth = getAuth();
    signOut(auth)
        .then(() => {
            console.log("User signed out successfully.");
        })
        .catch((error) => {
            console.error("Error signing out:", error);
        });
};