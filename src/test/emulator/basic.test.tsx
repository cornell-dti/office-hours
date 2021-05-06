import { expect } from 'chai';
import 'mocha';
import firebase from "firebase/app";
import {loadRules} from "./emulfirebase";
import {
    firebaseToEnvironment,
    generateDummyEnvironment,
    satisfiesEnvironmentInvariants,
    setupQMIEnvironment
} from "./environment";

// Load firestore rules
before(async function() {
    await loadRules();
});

// Delete firestore apps
after(function() {
    firebase.apps.forEach((app) => {
        return app.delete();
    });
});

describe('Test Database Structure', function(){
    const environment: FireEnvironment = generateDummyEnvironment();
    // const user: FireUser = environment.users[0];
    /* const adminDb = initTestAdminFirebase();
    const userDb = initTestUserFirebase({
        uid: user.userId,
        email: user.email
    }); */
    before(async () => {
        // Generate initial database configuration
        await setupQMIEnvironment(environment);
    })

    it('satisfies invariants', async function(){
        // Set a long timeout of 5s because it takes quite long on CI server
        this.timeout(5000);
        const retrievedEnv = await firebaseToEnvironment();
        expect(retrievedEnv.success).to.be.true;
        const result = retrievedEnv.data;
        expect(result).to.not.be.undefined;
        const satisfiesInvariants = satisfiesEnvironmentInvariants(result!);
        expect(satisfiesInvariants.satisfied).to.be.true;
    })

    after(async () => {
        // Clean up firebase app
    })
});
