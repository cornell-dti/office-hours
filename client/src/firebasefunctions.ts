export const userUpload = (user: firebase.User | null, db: firebase.firestore.Firestore) => {
  if (user != null) {
    const uid = user.uid;
    const email = user.email;
    const displayName = user.displayName;
    const photoUrl = user.photoURL;
    const metaData = user.metadata;
    const createdAt = metaData.creationTime;
    const lastActivityAt = metaData.lastSignInTime;
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
      lastActivityAt
    })
      .then(function () {
        // Successful upload
      })
      .catch(function (error: string) {
        // Unsuccessful upload
      });
  }
};