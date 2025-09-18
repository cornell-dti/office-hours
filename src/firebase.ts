import 'firebase/auth';
import 'firebase/firestore';

import firebase from 'firebase/app';
import { authState } from 'rxfire/auth';
import { collectionData } from 'rxfire/firestore';
import { filter } from 'rxjs/operators';

let firebaseConfig: Record<string, unknown>;
if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_IS_STAGING !== 'true') {
    firebaseConfig = {
        apiKey: process.env.REACT_APP_API_KEY,
        authDomain: "queue-me-in-oberlin-470213.firebaseapp.com",
        projectId: "queue-me-in-oberlin-470213",
        storageBucket: "queue-me-in-oberlin-470213.firebasestorage.app",
        messagingSenderId: "27148633978",
        appId: "1:27148633978:web:9fa990309f7c47d61878c3"
    };
} else {
    firebaseConfig = {
        apiKey: process.env.REACT_APP_API_KEY,
        authDomain: "queue-me-in-oberlin-470213.firebaseapp.com",
        projectId: "queue-me-in-oberlin-470213",
        storageBucket: "queue-me-in-oberlin-470213.firebasestorage.app",
        messagingSenderId: "27148633978",
        appId: "1:27148633978:web:9fa990309f7c47d61878c3"
    };

}

const app = firebase.initializeApp(firebaseConfig);


const firestore = firebase.firestore(app); // Initialize firestore
// Use emulator for test mode
if (process.env.NODE_ENV === 'test') {
    firestore.useEmulator('localhost', 8080);
}

const auth = firebase.auth(app); // Initialize firebase auth
const loggedIn$ = authState(auth).pipe(filter((user) => !!user)); // Observable only return when user is logged in.

const Timestamp = firebase.firestore.Timestamp;

export {
    app,
    auth,
    firestore,
    collectionData,
    loggedIn$,
    Timestamp
};

export default firebase;