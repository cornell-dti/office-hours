import firebase from "@firebase/rules-unit-testing";
import fs from "fs";
import path from "path";

type User = {
    uid: string;
    email: string;
}


// Grab real project ID from firebase config

const fakeProjectId = "qmi-test-project";

export const initTestAdminFirebase = () => {
    return firebase.initializeAdminApp({
        projectId: fakeProjectId
    }).firestore();
}

export const initTestUserFirebase = (user: User) => {
    return firebase.initializeTestApp({
        projectId: fakeProjectId,
        auth: user
    }).firestore();
}

// Load firebase rules before tests, update firebase rules in the test rules
export const loadRules = async () => {
    await firebase.loadFirestoreRules({
        projectId: fakeProjectId,
        rules: fs.readFileSync(path.resolve(__dirname, '../../../firestore_test.rules'), "utf-8")
    });
}
