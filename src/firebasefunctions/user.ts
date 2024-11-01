import firebase from 'firebase/app';


const auth = firebase.auth;

export const userUpload = (user: firebase.User | null, db: firebase.firestore.Firestore) => {
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
            db.runTransaction(async (transaction) => {
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
                // eslint-disable-next-line no-console
            }).catch(() => console.error('Unable to upload user.'));
        }
    }
};

export const updateUserHasSeen = async (userId: string, db: firebase.firestore.Firestore) => {
    const userRef = db.collection('users').doc(userId);
    try {
        await userRef.update({ hasSeen: true });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error updating user 'hasSeen':", error);
    }
};

export const logOut = () => {
    auth()
        .signOut()
        .then(() => {
            // Success
        })
        .catch(() => {
            // Fail
        });
};