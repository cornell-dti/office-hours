/* eslint-disable import/no-mutable-exports */
import type * as firebase from 'firebase';

import { initializeCollections } from './collections';

// eslint-disable-next-line import/no-mutable-exports
let app!: firebase.app.App;
let firestore!: firebase.firestore.Firestore;
let auth!: firebase.auth.Auth;

export function initializeApp(fireApp: firebase.app.App): void {
    app = fireApp;
    firestore = fireApp.firestore();
    auth = fireApp.auth();

    initializeCollections(firestore);
}

export default app;

export { firestore, auth };

