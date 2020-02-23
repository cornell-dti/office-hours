import 'firebase/auth';
import 'firebase/firestore';

import * as firebase from 'firebase/app';
import { authState } from 'rxfire/auth';
import { collectionData } from 'rxfire/firestore';
import { filter } from 'rxjs/operators';

const app = firebase.initializeApp({
    apiKey: 'AIzaSyDD2hsUMX3qvOEotKBXzc1ehtMyunix_I4',
    authDomain: 'qmi-test.firebaseapp.com',
    databaseURL: 'https://qmi-test.firebaseio.com',
    projectId: 'qmi-test',
    storageBucket: 'qmi-test.appspot.com',
    messagingSenderId: '349252319671',
});

const firestore = firebase.firestore(app); // Initialize firestore
const auth = firebase.auth(app); // Initialize firebase auth
const loggedIn$ = authState(auth).pipe(filter(user => !!user)); // Observable only return when user is logged in.

const Timestamp = firebase.firestore.Timestamp;

export { app, auth, firestore, collectionData, loggedIn$, Timestamp };

export default firebase;
