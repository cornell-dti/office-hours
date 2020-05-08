import * as functions from 'firebase-functions';
//import '../../src/components/types/fireData';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

//Use admin SDK to enable writing to other parts of database
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.onQuestionCreate = functions.firestore
.document('questions/{questionId}')
.onCreate((snap, context) => {
	//Get data object and obtain session ID
	const data = snap.data();
	//const createdQuestion =  data as FireQuestion;
	const sessionId = data!.sessionId;

	console.log(`Session ID is: ${sessionId}`);

	//Increment total number of questions of relevant session
	const increment = admin.firestore.FieldValue.increment(1);
	return db.doc(`sessions/${sessionId}`).update({
		totalQuestions: increment
	});

});