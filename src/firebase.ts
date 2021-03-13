import 'firebase/auth';
import 'firebase/firestore';

import firebase from 'firebase/app';
import { authState } from 'rxfire/auth';
import { collectionData } from 'rxfire/firestore';
import { filter } from 'rxjs/operators';

type FirebaseConfig = {
    apiKey: string,
    authDomain: string,
    databaseURL: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string,
    appId?: string,
    measurementId?: string
};

let firebaseConfig: FirebaseConfig;
if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_IS_STAGING !== 'true') {
    firebaseConfig = {
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
    firebaseConfig = {
        apiKey: 'AIzaSyDD2hsUMX3qvOEotKBXzc1ehtMyunix_I4',
        authDomain: 'qmi-test.firebaseapp.com',
        databaseURL: 'https://qmi-test.firebaseio.com',
        projectId: 'qmi-test',
        storageBucket: 'qmi-test.appspot.com',
        messagingSenderId: '349252319671',
    };
}

const app = firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore(app); // Initialize firestore
// Use emulator for test mode
if (process.env.NODE_ENV === 'test') {
    firestore.useEmulator("localhost", 8080);
}

const auth = firebase.auth(app); // Initialize firebase auth
const loggedIn$ = authState(auth).pipe(filter(user => !!user)); // Observable only return when user is logged in.

const Timestamp = firebase.firestore.Timestamp;

export { app, auth, firestore, collectionData, loggedIn$, Timestamp, firebaseConfig };

export default firebase;
