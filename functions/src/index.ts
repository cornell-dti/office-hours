import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Use admin SDK to enable writing to other parts of database
// const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/** Adds new roles to a user without them being in QMI's system
 * Not inclusive: Still need to consider users that are
 * already in the system. (THIS CASE IS HANDLED BY NOT INCLDUING THEM IN THE
 * pendingUsers COLLECTION IN THE FIRST PLACE)
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
                    {tas: admin.firestore.FieldValue.arrayUnion(userId)}
                );
            });

            profCourseDocs.map((doc, index) => {
                if (!doc.exists) {
                    functions.logger.error('prof course doc does not exist.')
                }

                const courseId = profCourseIds[index];
                // const course = doc.data() as FireCourse;
                batch.update(
                    db.collection('courses').doc(courseId),
                    {professors: admin.firestore.FieldValue.arrayUnion(userId)}
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

exports.onSessionUpdate = functions.firestore
    .document('sessions/{sessionId}')
    .onUpdate((change) => {
        const data = change.after.data();
        const sessionId = data!.sessionId;
        functions.logger.log(`Session ${sessionId} was updated.`);
    })

exports.onQuestionCreate = functions.firestore
    .document('questions/{questionId}')
    .onCreate(async (snap) => {
        // Get data object and obtain session ID
        const data = snap.data();
        const sessionId = data!.sessionId;
        const session = (await db.collection('sessions').doc(sessionId).get()).data() as FireSession;
        const course = (await db.collection('courses').doc(session.courseId).get()).data() as FireCourse;

        // Log Session ID for debugging
        // functions.logger.log(`Session ID is: ${sessionId}`);

        // Increment total number of questions of relevant session
        const increment = admin.firestore.FieldValue.increment(1);
        course.tas.forEach(ta => {
            db.doc(`users/${ta}`).update({
                notificationList: admin.firestore.FieldValue.arrayUnion({
                    title: 'New Question',
                    subtitle: 'A new question has been added',
                    message: 'A new question has been added',
                    createdAt: admin.database.ServerValue.TIMESTAMP
                })
            })
        });
        course.professors.forEach(professor => {
            db.doc(`users/${professor}`).update({
                notificationList: admin.firestore.FieldValue.arrayUnion({
                    title: 'New Question',
                    subtitle: 'A new question has been added',
                    message: 'A new question has been added',
                    createdAt: admin.database.ServerValue.TIMESTAMP
                })
            })
        });
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
    .onUpdate(async (change) => {
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

        // Figure out who needs to be updated with a notification based on the changes
        const asker: FireUser = (await db.doc(`users/${newQuestion.askerId}`).get()).data() as FireUser;
        const answerer: FireUser = (await db.doc(`users/${newQuestion.answererId}`).get()).data() as FireUser;
        
        if (prevQuestion.taComment !== newQuestion.taComment) {
            db.doc(`notificationTrackers/${asker.email}`)
                .update({notificationList: admin.firestore.FieldValue.arrayUnion({
                    title: 'TA comment',
                    subtitle: 'New TA comment',
                    message: newQuestion.taComment,
                    createdAt: admin.database.ServerValue.TIMESTAMP
                })});
        }

        if (prevQuestion.studentComment !== newQuestion.studentComment) {
            db.doc(`notificationTrackers/${answerer.email}`)
                .update({notificationList: admin.firestore.FieldValue.arrayUnion({
                    title: 'Student comment',
                    subtitle: 'New student comment',
                    message: newQuestion.studentComment,
                    createdAt: admin.database.ServerValue.TIMESTAMP
                })});
        }
        if (
            prevQuestion.answererId !== newQuestion.answererId && 
        newQuestion.answererId !== ''
        ) {
            db.doc(`notificationTrackers/${asker.email}`)
                .update({notificationList: admin.firestore.FieldValue.arrayUnion({
                    title: 'TA Assigned',
                    subtitle: 'TA Assigned',
                    message: 'A TA has been assigned to your question',
                    createdAt: admin.database.ServerValue.TIMESTAMP
                })});
        }

        if (
            prevQuestion.answererId !== newQuestion.answererId && 
        newQuestion.answererId === ''
        ) {
            db.doc(`notificationTrackers/${asker.email}`)
                .update({notificationList: admin.firestore.FieldValue.arrayUnion({
                    title: 'TA Unassigned',
                    subtitle: 'TA Unassigned',
                    message: 
                  'A TA has been unassigned from your question and you\'ve been readded to the top of the queue.',
                    createdAt: admin.database.ServerValue.TIMESTAMP
                })});
        }
        if(newQuestion.status === 'resolved' ) {
            db.doc(`notificationTrackers/${asker.email}`)
                .update({notificationList: admin.firestore.FieldValue.arrayUnion({
                    title: 'Question resolved',
                    subtitle: 'Question marked as resolved',
                    message: 
              'A TA has marked your question as resolved and you have been removed from the queue',
                    createdAt: admin.database.ServerValue.TIMESTAMP
                })});
        } else if(newQuestion.status === "no-show" ) {
            db.doc(`notificationTrackers/${asker.email}`)
                .update({notificationList: admin.firestore.FieldValue.arrayUnion({
                    title: 'Question marked no-show',
                    subtitle: 'Question marked as no-show',
                    message: 
              'A TA has marked your question as no-show and you have been removed from the queue',
                    createdAt: admin.database.ServerValue.TIMESTAMP
                })}); 
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
