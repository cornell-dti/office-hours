import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Use admin SDK to enable writing to other parts of database
// const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/** Adds new roles to a user without them being in QMI's system
 * Not inclusive: Still need to consider users that are
 * already in the system. (THIS CASE IS HANDLED BY NOT INCLDUING THEM IN THE
 * pendingUsers COLLECTIONIN THE FIRST PLACE)
 */
exports.onUserCreate = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
        const userId = context.params.userId;

        // get the user doc
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        const user = userDoc.data() as FireUser;

        const currentRoles = user.roles;
        const email = user.email;

        // match this email with a user in the pendingUsers collection
        const pendingUsersSnap = await db.collection('pendingUsers').where('email', '==', email).get();

        pendingUsersSnap.forEach(async doc => {

            // delete the pendingUsers entry because they now exist in QMI...
            await db.collection('pendingUsers').doc(doc.id).delete();

            // get the users's roles map as a Map<string, FireCourseRole>
            const newRoles = (doc.data() as FirePendingUser).roles;
            const taCourseIds: string[] = [];
            const profCourseIds: string[] = [];

            for (const [courseId, role] of Object.entries(newRoles)) {

                if (role === 'ta') {
                    taCourseIds.push(courseId);
                } else if (role === 'professor') {
                    profCourseIds.push(courseId);
                }
            }
            
            const batch = db.batch();

            // and update the newly-created user with their new roles
            userRef.update({
                courses: [...taCourseIds, ...profCourseIds],
                roles: {...currentRoles, ...newRoles}
            })

            const taCourseDocs = await Promise.all(
                taCourseIds.map(courseId => db.collection('courses').doc(courseId).get()));
                        
            const profCourseDocs = await Promise.all(
                profCourseIds.map(courseId => db.collection('courses').doc(courseId).get()));

            taCourseDocs.map((doc, index) => {
                if (!doc.exists) {
                    functions.logger.error('ta course doc does not exist.')
                }

                const courseId = taCourseIds[index];
                
                // const course = doc.data() as FireCourse;
                batch.update(
                    db.collection('courses').doc(courseId),
                    {tas: [userId]}
                );
            });

            profCourseDocs.map((doc, index) => {
                if (!doc.exists) {
                    functions.logger.error('prof course doc does not exist.')
                }

                const courseId = taCourseIds[index];
                
                // const course = doc.data() as FireCourse;
                batch.update(
                    db.collection('courses').doc(courseId),
                    {professors: [userId]}
                );
            });

            await batch.commit();
        });

    });

// const insertTaOrProf = (course: FireCourse, userId: string, role: string) => {
//     // eslint-disable-next-line
//     functions.logger.log('inserting into course:');
//     // eslint-disable-next-line
//     functions.logger.log(course)
//     if (role === 'ta') {
//         course.tas = course.tas? [...course.tas, userId] : [userId];
//     }
//     if (role === 'professor') {
//         course.professors = course.tas? [...course.professors, userId] : [userId];
//     }

//     return course;
// }

exports.onQuestionCreate = functions.firestore
    .document('questions/{questionId}')
    .onCreate((snap) => {
        // Get data object and obtain session ID
        const data = snap.data();
        const sessionId = data!.sessionId;

        // Log Session ID for debugging
        // functions.logger.log(`Session ID is: ${sessionId}`);

        // Increment total number of questions of relevant session
        const increment = admin.firestore.FieldValue.increment(1);
        return db.doc(`sessions/${sessionId}`).update({
            totalQuestions: increment,
        });
    });

// This map maps a question status to a tuple of
// 1. The number of questions this counts as (0 if no show or retracted)
// 2. The number of assigned questions this counts as (1 if assigned / resolved)
// 3. The number of resolved questions this counts as (1 if resolved only)
const questionStatusNumbers = new Map<string, [number, number, number]>();
questionStatusNumbers.set("assigned", [1, 1, 0]);
questionStatusNumbers.set("resolved", [1, 1, 1]);
questionStatusNumbers.set("retracted", [0, 0, 0]);
questionStatusNumbers.set("unresolved", [1, 0, 0]);
questionStatusNumbers.set("no-show", [0, 0, 0]);

exports.onQuestionUpdate = functions.firestore
    .document('questions/{questionId}')
    .onUpdate((change) => {
        const newQuestion: FireQuestion = change.after.data() as FireQuestion;
        const prevQuestion: FireQuestion = change.before.data() as FireQuestion;

        // Derive session ID
        const sessionId = newQuestion.sessionId;

        // Derive changes in counts
        const newStatus = newQuestion.status;
        const prevStatus = prevQuestion.status;
        const newNumbers = questionStatusNumbers.get(newStatus)!;
        const prevNumbers = questionStatusNumbers.get(prevStatus)!;

        // Grab number of changes
        const numQuestionChange = newNumbers[0] - prevNumbers[0];
        const numAssignedChange = newNumbers[1] - prevNumbers[1];
        const numResolvedChange = newNumbers[2] - prevNumbers[2];

        let waitTimeChange = 0;
        let resolveTimeChange = 0;

        // Derive timing changes (changes from assigned to unassigned)
        if (numAssignedChange === 1 && newQuestion.timeAssigned !== undefined){
            // Add new time addressed
            waitTimeChange = newQuestion.timeAssigned.seconds - newQuestion.timeEntered.seconds;
        }
        else if (numAssignedChange === -1 && prevQuestion.timeAssigned !== undefined){
            // Subtract previous time addressed
            waitTimeChange = prevQuestion.timeEntered.seconds - prevQuestion.timeAssigned.seconds;
        }

        // Derive timing changes (changes from assigned to resolved)
        if (numResolvedChange === 1  && newQuestion.timeAssigned !== undefined){
            resolveTimeChange = newQuestion.timeAddressed!.seconds - newQuestion.timeAssigned.seconds;
        }
        else if (numResolvedChange === -1
            && prevQuestion.timeAssigned !== undefined
            && prevQuestion.timeAddressed !== undefined
        ){
            resolveTimeChange = prevQuestion.timeAssigned.seconds - prevQuestion.timeAddressed.seconds;
        }

        // Log for debugging
        /* functions.logger.log(`Status change from ${prevStatus} to ${newStatus}. Changes:
            ${numQuestionChange} ${numAssignedChange} ${numResolvedChange}
            ${waitTimeChange} ${resolveTimeChange}`); */

        // Update relevant statistics in database
        return db.doc(`sessions/${sessionId}`).update({
            totalQuestions: admin.firestore.FieldValue.increment(numQuestionChange),
            assignedQuestions: admin.firestore.FieldValue.increment(numAssignedChange),
            resolvedQuestions: admin.firestore.FieldValue.increment(numResolvedChange),
            totalWaitTime: admin.firestore.FieldValue.increment(waitTimeChange),
            totalResolveTime: admin.firestore.FieldValue.increment(resolveTimeChange),
        });
    });
