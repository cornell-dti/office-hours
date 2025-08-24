import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Timestamp } from 'firebase/firestore';
import { authState } from 'rxfire/auth';
import { collectionData } from 'rxfire/firestore';
import { filter } from 'rxjs/operators';

let firebaseConfig: Record<string, unknown>;
if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_IS_STAGING !== 'true') {
    firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: "queue-me-in-oberlin.firebaseapp.com",
    projectId: "queue-me-in-oberlin",
    storageBucket: "queue-me-in-oberlin.firebasestorage.app",
    messagingSenderId: "1041093971965",
    appId: "1:1041093971965:web:1d59d7aedf97c17cb8d394",
    measurementId: "G-JJ6KRB9D3E"
    };
} else {
    firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: "queue-me-in-oberlin.firebaseapp.com",
    projectId: "queue-me-in-oberlin",
    storageBucket: "queue-me-in-oberlin.firebasestorage.app",
    messagingSenderId: "1041093971965",
    appId: "1:1041093971965:web:1d59d7aedf97c17cb8d394",
    measurementId: "G-JJ6KRB9D3E"
    };

}

const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

if (process.env.NODE_ENV === 'test') {
    connectFirestoreEmulator(firestore, 'localhost', 8080);
}

const auth = getAuth(app);

const loggedIn$ = authState(auth).pipe(filter((user) => !!user));

export {
    app,
    auth,
    firestore,
    collectionData,
    loggedIn$,
    Timestamp
};
