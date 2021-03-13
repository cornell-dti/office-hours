import { expect } from 'chai';
import 'mocha';
import firebase from "firebase/app";
import {loadRules} from "./emulfirebase";

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

describe('Database Structure', function(){
    before(async () => {
        // Generate initial database configuration
    })

    it('can be created correctly', async function(){
        // Set a long timeout of 5s because it takes quite long on CI server
        this.timeout(5000);
    })
});

describe('Unknown Question', function() {
     it('should not exist', async function() {
         // Set a long timeout of 5s because it takes quite long on CI server
         this.timeout(5000);

         // Expect question one to not exist
         const questionOne = firestore.collection('questions').doc("1").get();
         const result = await questionOne

         expect(result.exists).to.be.false;

         return Promise.resolve();
     });
});
