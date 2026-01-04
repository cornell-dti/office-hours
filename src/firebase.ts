import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Timestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { authState } from 'rxfire/auth';
import { collectionData } from 'rxfire/firestore';
import { filter } from 'rxjs/operators';

let firebaseConfig: Record<string, unknown>;
if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_IS_STAGING !== 'true') {
    firebaseConfig = {
        apiKey: process.env.REACT_APP_API_KEY,
        authDomain: "queue-me-in-prod.firebaseapp.com",
        databaseURL: "https://queue-me-in-prod.firebaseio.com",
        projectId: "queue-me-in-prod",
        storageBucket: "queue-me-in-prod.appspot.com",
        messagingSenderId: "283964683310",
        appId: "1:283964683310:web:98ef1bd535c6315749dbbf",
        measurementId: "G-GHJ0TML275"
    };
} else {
    firebaseConfig = {
        apiKey: process.env.REACT_APP_TEST_KEY ? process.env.REACT_APP_TEST_KEY : process.env.REACT_APP_API_KEY,
        authDomain: 'qmi-test.firebaseapp.com',
        databaseURL: 'https://qmi-test.firebaseio.com',
        projectId: 'qmi-test',
        storageBucket: 'qmi-test.firebasestorage.app',
        messagingSenderId: '349252319671',
    };
}

const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

if (process.env.NODE_ENV === 'test') {
    connectFirestoreEmulator(firestore, 'localhost', 8080);
}

const auth = getAuth(app);
const storage = getStorage(app);

const loggedIn$ = authState(auth).pipe(filter((user) => !!user));

export {
    app,
    auth,
    firestore,
    storage,
    collectionData,
    loggedIn$,
    Timestamp
};
