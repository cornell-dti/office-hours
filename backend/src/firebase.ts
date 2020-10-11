
import * as admin from "firebase-admin";

let cert = null;

if (process.env.FIREBASE_CREDENTIALS) {
    const keyfile = JSON.parse(process.env.FIREBASE_CREDENTIALS);

    cert = admin.credential.cert(keyfile);
}

// eslint-disable-next-line import/no-mutable-exports
let app: admin.app.App;

if (cert) {
    app = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        credential: cert
    });
} else {
    app = admin.initializeApp();
}

export default app;