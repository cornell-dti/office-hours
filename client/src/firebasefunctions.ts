import { firestore, auth } from 'firebase/app';

export const userUpload = (user: firebase.User | null, db: firebase.firestore.Firestore) => {
  if (user != null) {
    const uid = user.uid;
    const email = user.email;
    const displayName = user.displayName;
    const photoUrl = user.photoURL;
    const metaData = user.metadata;
    const createdAt = metaData.creationTime;
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
    db.collection('users').doc(uid).set({
      email,
      firstName,
      lastName,
      photoUrl,
      createdAt,
      lastActivityAt: firestore.FieldValue.serverTimestamp()
    })
      .then(function () {
        // Successful upload
      })
      .catch(function (error: string) {
        // Unsuccessful upload
      });
  }
};

export const logOut = () => {
  auth().signOut().then(() => {
    // Success
  }).catch(error => {
    // Fail
  });
};
