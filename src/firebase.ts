import 'firebase/auth';
import 'firebase/firestore';

import firebase from 'firebase/app';
import { authState } from 'rxfire/auth';
import { collectionData } from 'rxfire/firestore';
import { filter } from 'rxjs/operators';
import {initTestAdminFirebase} from "./test/emulator/emulfirebase";

type FirebaseConfig = {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId?: string;
    measurementId?: string;
};

let currFirebaseConfig: FirebaseConfig;
if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_IS_STAGING !== 'true') {
    currFirebaseConfig = {
        apiKey: 'AIzaSyBtxSkhR9RcnKP2FSsWtdxlwX4TcIjjm8A',
        authDomain: 'queue-me-in-prod.firebaseapp.com',
        databaseURL: 'https://queue-me-in-prod.firebaseio.com',
        projectId: 'queue-me-in-prod',
        storageBucket: 'queue-me-in-prod.appspot.com',
        messagingSenderId: '283964683310',
        appId: '1:283964683310:web:98ef1bd535c6315749dbbf',
        measurementId: 'G-GHJ0TML275',
    };
} else {
    currFirebaseConfig = {
        apiKey: 'AIzaSyDD2hsUMX3qvOEotKBXzc1ehtMyunix_I4',
        authDomain: 'qmi-test.firebaseapp.com',
        databaseURL: 'https://qmi-test.firebaseio.com',
        projectId: 'qmi-test',
        storageBucket: 'qmi-test.appspot.com',
        messagingSenderId: '349252319671',
    };
}
const firebaseConfig = currFirebaseConfig;

const app = firebase.initializeApp(firebaseConfig);

let tmpFirestore = firebase.firestore(app); // Initialize firestore
// Use emulator for test mode
if (process.env.NODE_ENV === 'test') {
    tmpFirestore.useEmulator('localhost', 8080);
}

const auth = firebase.auth(app); // Initialize firebase auth
const loggedIn$ = authState(auth).pipe(filter((user) => !!user)); // Observable only return when user is logged in.

const Timestamp = firebase.firestore.Timestamp;

if (process.env.NODE_ENV === 'test') {
    // Use fake admin app
    // Note: We want to do this for some user under test, but there's
    // no good way to dependency inject this user :(
    // Someone else can figure out how to deal with this. I'm graduating.
    tmpFirestore = initTestAdminFirebase();
    // Use emulator for test mode
    // firestore.useEmulator("localhost", 8080);
    // TODO: Find some way to emulate auth and loggedIn$ in test mode
}

const firestore = tmpFirestore;

export { app, auth, firestore, collectionData, loggedIn$, Timestamp, firebaseConfig };

export default firebase;
