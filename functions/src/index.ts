import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

//import '../../src/components/types/fireData';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// Use admin SDK to enable writing to other parts of database
// const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.onQuestionCreate = functions.firestore
    .document('questions/{questionId}')
    .onCreate((snap) => {
        // Get data object and obtain session ID
        const data = snap.data();
        const sessionId = data!.sessionId;

        // Log Session ID for debugging
        // console.log(`Session ID is: ${sessionId}`);

        // Increment total number of questions of relevant session
        const increment = admin.firestore.FieldValue.increment(1);
        return db.doc(`sessions/${sessionId}`).update({
            totalQuestions: increment
        });
    });

// This map maps a question status to a tuple of
// 1. The number of questions this counts as (0 if no show or retracted)
// 2. The number of assigned questions this counts as (1 if assigned / resolved)
// 3. The number of resolved questions this counts as (1 if resolved only)
const questionStatusNumbers = new Map<string, number[]>();
questionStatusNumbers.set("assigned", [1, 1, 0]);
questionStatusNumbers.set("resolved", [1, 1, 1]);
questionStatusNumbers.set("retracted", [0, 0, 0]);
questionStatusNumbers.set("unresolved", [1, 0, 0]);
questionStatusNumbers.set("no-show", [0, 0, 0]);

exports.onQuestionUpdate = functions.firestore
    .document('questions/{questionId}')
    .onUpdate((change) => {
        const newQuestion = change.after.data()!;
        const prevQuestion = change.before.data()!;

        //Derive session ID
        const sessionId = newQuestion.sessionId;

        //Derive changes in counts
        const newStatus = newQuestion.status;
        const prevStatus = prevQuestion.status;
        const newNumbers = questionStatusNumbers.get(newStatus)!;
        const prevNumbers = questionStatusNumbers.get(prevStatus)!;

        //Grab number of changes
        const numQuestionChange = newNumbers[0] - prevNumbers[0];
        const numAssignedChange = newNumbers[1] - prevNumbers[1];
        const numResolvedChange = newNumbers[2] - prevNumbers[2];

        let waitTimeChange = 0;
        let resolveTimeChange = 0;

        // Derive timing changes (changes from assigned to unassigned)
        if (numAssignedChange == 1){
            // Add new time addressed
            waitTimeChange = newQuestion.timeAssigned.seconds - newQuestion.timeEntered.seconds;
        }
        else if (numAssignedChange == -1){
            // Subtract previous time addressed
            waitTimeChange = prevQuestion.timeEntered.seconds - prevQuestion.timeAssigned.seconds;
        }

        // Derive timing changes (changes from assigned to resolved)
        if (numResolvedChange == 1){
            resolveTimeChange = newQuestion.timeAddressed.seconds - newQuestion.timeAssigned.seconds;
        }
        else if (numResolvedChange == -1){
            resolveTimeChange = prevQuestion.timeAssigned.seconds - prevQuestion.timeAddressed.seconds;
        }

        // Log for debugging
        /*console.log(`Status change from ${prevStatus} to ${newStatus}. Changes:
            ${numQuestionChange} ${numAssignedChange} ${numResolvedChange}
            ${waitTimeChange} ${resolveTimeChange}`);*/

        // Update relevant statistics in database
        return db.doc(`sessions/${sessionId}`).update({
            totalQuestions: admin.firestore.FieldValue.increment(numQuestionChange),
            assignedQuestions: admin.firestore.FieldValue.increment(numAssignedChange),
            resolvedQuestions: admin.firestore.FieldValue.increment(numResolvedChange),
            totalWaitTime: admin.firestore.FieldValue.increment(waitTimeChange),
            totalResolveTime: admin.firestore.FieldValue.increment(resolveTimeChange),
        });
    });