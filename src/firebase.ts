import 'firebase/auth';
import 'firebase/firestore';

import firebase from 'firebase/app';
import { authState } from 'rxfire/auth';
import { collectionData } from 'rxfire/firestore';
import { filter } from 'rxjs/operators';

let firebaseConfig: object;
let stanfordConfig: object;
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
    stanfordConfig = {
        apiKey: 'AIzaSyDD2hsUMX3qvOEotKBXzc1ehtMyunix_I4',
        authDomain: 'queue-me-in-prod-stanford.firebaseapp.com',
        databaseURL: 'https://queue-me-in-prod-stanford.firebaseio.com',
        projectId: 'queue-me-in-prod-stanford',
        storageBucket: 'queue-me-in-prod-stanford.appspot.com',
        messagingSenderId: '124053693123',
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
    stanfordConfig = {
        apiKey: 'AIzaSyDD2hsUMX3qvOEotKBXzc1ehtMyunix_I4',
        authDomain: 'qmi-test.firebaseapp.com',
        databaseURL: 'https://qmi-test.firebaseio.com',
        projectId: 'qmi-test',
        storageBucket: 'qmi-test.appspot.com',
        messagingSenderId: '349252319671',
    };
}

const app = firebase.initializeApp(firebaseConfig);

const stanfordApp = firebase.initializeApp(stanfordConfig, 'stanford');

const firestore = firebase.firestore(app); // Initialize firestore
// Use emulator for test mode
if (process.env.NODE_ENV === 'test') {
    firestore.useEmulator('localhost', 8080);
}

const stanfordFirestore = firebase.firestore(stanfordApp);

const auth = firebase.auth(app); // Initialize firebase auth
const stanfordAuth = firebase.auth(stanfordApp);
const loggedIn$ = authState(auth).pipe(filter((user) => !!user)); // Observable only return when user is logged in.
const stanfordLoggedIn$ = authState(stanfordAuth).pipe(filter((user) => !!user));

const Timestamp = firebase.firestore.Timestamp;

export { 
    app, 
    stanfordApp, 
    auth, 
    stanfordAuth, 
    firestore, 
    stanfordFirestore, 
    collectionData, 
    loggedIn$, 
    stanfordLoggedIn$, 
    Timestamp 
};

export default firebase;
