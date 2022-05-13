/* eslint-disable @typescript-eslint/no-explicit-any */
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { 
    firestore, 
    stanfordFirestore, 
    loggedIn$, 
    stanfordLoggedIn$, 
} from '../firebase';

const getFirestore = (user: firebase.User | null): firebase.firestore.Firestore => {
    switch(true) {
        case !(user?.email === null || user?.email === undefined) && 
      user?.email.includes("cornell"):
            return firestore;
        case !(user?.email === null || user?.email === undefined) && 
      user?.email.includes('stanford'):
            return stanfordFirestore;
        default:
            return firestore;
    }
}

const getLoggedIn = (user: firebase.User | null): Observable<any> => {
    switch(true) {
        case !(user?.email === null || user?.email === undefined) && 
      user?.email.includes("cornell"):
            return loggedIn$;
        case !(user?.email === null || user?.email === undefined) && 
      user?.email.includes('stanford'):
            return stanfordLoggedIn$;
        default:
            return loggedIn$;
    }
}

const getFirestoreLoggedIn = (user: firebase.User | null): [firebase.firestore.Firestore, Observable<any>] => {
    return [getFirestore(user), getLoggedIn(user)];
}

export {getFirestore, getLoggedIn, getFirestoreLoggedIn};