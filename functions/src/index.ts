import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Twilio } from 'twilio';

// Use admin SDK to enable writing to other parts of database
// const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Twilio Setup
const accountSid = functions.config().twilio.accountsid;
const authToken = functions.config().twilio.twilio_auth_token;
const twilioNumber = functions.config().twilio.twilionumber;

const client = new Twilio(accountSid, authToken);

/**
 * Function that handles data and sends a text message to a requested phone number
 */
async function sendSMS (user: FireUser, message: string) {
    if(process.env.DATABASE === "staging") {
        return;
    }
    const userPhone = user.phoneNumber;
    if (userPhone === "Dummy number" || userPhone === undefined)
        return;
    try {
        await client.messages
            .create({
                from: twilioNumber,
                to: userPhone,
                body: `[QueueMeIn] ${message}`.replace(/\s+/g, " "),
            }).then(msg => {
                functions.logger.log(msg);
            });
    } catch (error) {
        functions.logger.log(error);
    }
}

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
                roles: { ...currentRoles, ...newRoles }
            })

            const taCourseDocs = await Promise.all(
                taCourseIds.map(courseId => db.collection('courses').doc(courseId).get()));

            const profCourseDocs = await Promise.all(
                profCourseIds.map(courseId => db.collection('courses').doc(courseId).get()));
            taCourseDocs.forEach((taDoc, index) => {
                if (!taDoc.exists) {
                    functions.logger.error('ta course doc does not exist.')
                }

                const courseId = taCourseIds[index];

                // const course = doc.data() as FireCourse;
                batch.update(
                    db.collection('courses').doc(courseId),
                    { tas: admin.firestore.FieldValue.arrayUnion(userId) }
                );
            });

            profCourseDocs.forEach((pfDoc, index) => {
                if (!pfDoc.exists) {
                    functions.logger.error('prof course doc does not exist.')
                }

                const courseId = profCourseIds[index];
                // const course = doc.data() as FireCourse;
                batch.update(
                    db.collection('courses').doc(courseId),
                    { professors: admin.firestore.FieldValue.arrayUnion(userId) }
                );
            });

            await batch.commit();
        });

    });

exports.onCommentCreate = functions.firestore
    .document(`questions/{questionId}/comments/{commentId}`)
    .onCreate(async (snap) => {
        const data = snap.data();
        const askerId = data.askerId;
        const answererId = data.answererId;
        const commenterId = data.commenterId;
        const asker: FireUser = (await db.doc(`users/${askerId}`).get()).data() as FireUser;
        if(askerId === commenterId && answererId !== "") {
            const answerer: FireUser = (await db.doc(`users/${answererId}`).get()).data() as FireUser;
            db.doc(`notificationTrackers/${answerer.email}`)
                .update({
                    notificationList: admin.firestore.FieldValue.arrayUnion({
                        title: 'Student comment',
                        subtitle: "New student comment",
                        message: `${asker.firstName} commented \
                        on your assigned question`.trim(),
                        createdAt: admin.firestore.Timestamp.now()
                    })
                }).catch(() => {
                    db.doc(`notificationTrackers/${answerer.email}`).create({id: answerer.email,
                        notificationList: [{
                            title: 'Student comment',
                            subtitle: "New student comment",
                            message: `${asker.firstName} commented \
                        on your assigned question`.trim(),
                            createdAt: admin.firestore.Timestamp.now()
                        }],
                        notifications: admin.firestore.Timestamp.now(),
                        productUpdates: admin.firestore.Timestamp.now(),
                        lastSent: admin.firestore.Timestamp.now(),})
                    
                });
        } else {
            db.doc(`notificationTrackers/${asker.email}`)
                .update({
                    notificationList: admin.firestore.FieldValue.arrayUnion({
                        title: 'TA comment',
                        subtitle: 'New TA comment',
                        message: `A TA commented on your question`.trim(),
                        createdAt: admin.firestore.Timestamp.now()
                    })
                }).catch(() => {
                    db.doc(`notificationTrackers/${asker.email}`).create({id: asker.email,
                        notificationList: [{
                            title: 'TA comment',
                            subtitle: 'New TA comment',
                            message: `A TA commented on your question`.trim(),
                            createdAt: admin.firestore.Timestamp.now()
                        }],
                        notifications: admin.firestore.Timestamp.now(),
                        productUpdates: admin.firestore.Timestamp.now(),
                        lastSent: admin.firestore.Timestamp.now(),})
                    
                });
        }
    })

exports.onSessionUpdate = functions.firestore
    .document('sessions/{sessionId}')
    .onUpdate(async (change) => {
        // retrieve session id and ordered queue of active questions
        const afterSessionId = change.after.id;
        const afterQuestions = (await db.collection('questions')
            .where('sessionId', '==', afterSessionId)
            .where('status', 'in', ['assigned', 'unresolved'])
            .orderBy('timeEntered', 'asc').get()).docs;

        const sessionName: string | undefined= (change.after.data() as FireSession).title

        const topQuestion: FireQuestion = (afterQuestions[0].data() as FireQuestion);

        // if the top active question was not notified, notify them
        if (!topQuestion.wasNotified) {
            const asker: FireUser = (await db.doc(`users/${topQuestion.askerId}`)
                .get()).data() as FireUser;
            sendSMS(asker, `Your question has reached the top of the \
                ${sessionName} queue. A TA will likely help you shortly.`);
            db.doc(`notificationTrackers/${asker.email}`)
                .update({
                    notificationList: admin.firestore.FieldValue.arrayUnion({
                        title: 'Your Question is Up!',
                        subtitle: `Your question has reached the top of the \
                     ${sessionName} queue.`,
                        message: `Your question has reached the top of the \
                    ${sessionName} queue. A TA will likely help you shortly.`,
                        createdAt: admin.firestore.Timestamp.now()
                    })
                }).catch(() => {
                    db.doc(`notificationTrackers/${asker.email}`).create({id: asker.email,
                        notificationList: [{
                            title: 'Your Question is Up!',
                            subtitle: `Your question has reached the top of the \
                     ${sessionName} queue.`,
                            message: `Your question has reached the top of the \
                    ${sessionName} queue. A TA will likely help you shortly.`,
                            createdAt: admin.firestore.Timestamp.now()
                        }],
                        notifications: admin.firestore.Timestamp.now(),
                        productUpdates: admin.firestore.Timestamp.now(),
                        lastSent: admin.firestore.Timestamp.now(),})
          
                });
            db.doc(`questions/${afterQuestions[0].id}`).update({
                wasNotified: true
            })
        }
    })

exports.onQuestionCreate = functions.firestore
    .document('questions/{questionId}')
    .onCreate(async (snap) => {
        // Get data object and obtain session/course
        const data = snap.data();
        const sessionId = data.sessionId;
        const session = (await db.collection('sessions').doc(sessionId).get()).data() as FireSession;
        const course = (await db.collection('courses').doc(session.courseId).get()).data() as FireCourse;

        // Increment total number of questions of relevant session
        const increment = admin.firestore.FieldValue.increment(1);

        // Add new question notification for all TAs
        course.tas.forEach(async ta => {
            const user: FireUser = (await db.doc(`users/${ta}`).get()).data() as FireUser;
            db.doc(`notificationTrackers/${user.email}`).update({
                notificationList: admin.firestore.FieldValue.arrayUnion({
                    title: 'New Question',
                    subtitle: `A new question has been added to the ${session.title} queue`,
                    message: `A new question has been added to the ${session.title} queue`,
                    createdAt: admin.firestore.Timestamp.now()
                })
            }).catch(() => {
                db.doc(`notificationTrackers/${user.email}`).create({id: user.email,
                    notificationList: [{
                        title: 'New Question',
                        subtitle: `A new question has been added to the ${session.title} queue`,
                        message: `A new question has been added to the ${session.title} queue`,
                        createdAt: admin.firestore.Timestamp.now()
                    }],
                    notifications: admin.firestore.Timestamp.now(),
                    productUpdates: admin.firestore.Timestamp.now(),
                    lastSent: admin.firestore.Timestamp.now(),})
              
            })
        });

        // Add new question notification for all Professors
        course.professors.forEach(async professor => {
            const user: FireUser = (await db.doc(`users/${professor}`).get()).data() as FireUser;
            db.doc(`notificationTrackers/${user.email}`).update({
                notificationList: admin.firestore.FieldValue.arrayUnion({
                    title: 'New Question',
                    subtitle: `A new question has been added to the ${session.title} queue`,
                    message: `A new question has been added to the ${session.title} queue`,
                    createdAt: admin.firestore.Timestamp.now()
                })
            }).catch(() => {
                db.doc(`notificationTrackers/${user.email}`).create({id: user.email,
                    notificationList: [{
                        title: 'New Question',
                        subtitle: `A new question has been added to the ${session.title} queue`,
                        message: `A new question has been added to the ${session.title} queue`,
                        createdAt: admin.firestore.Timestamp.now()
                    }],
                    notifications: admin.firestore.Timestamp.now(),
                    productUpdates: admin.firestore.Timestamp.now(),
                    lastSent: admin.firestore.Timestamp.now(),})
            
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
        // Log when the function is triggered
        functions.logger.info("Function triggered", {
            questionId: change.after.id,
        });
        // retrieve old and new questions
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
        if (numAssignedChange === 1 && newQuestion.timeAssigned !== undefined) {
            // Add new time addressed
            waitTimeChange =
                (newQuestion.timeAssigned.seconds - newQuestion.timeEntered.seconds) / (newQuestion.position || 1);
        } else if (numAssignedChange === -1 && prevQuestion.timeAssigned !== undefined) {
            // Subtract previous time addressed
            waitTimeChange =
                (prevQuestion.timeEntered.seconds - prevQuestion.timeAssigned.seconds) / (newQuestion.position || 1);
        }

        // Derive timing changes (changes from assigned to resolved)
        if (numResolvedChange === 1 && newQuestion.timeAssigned !== undefined) {
            resolveTimeChange = newQuestion.timeAddressed!.seconds - newQuestion.timeAssigned.seconds;
        } else if (
            numResolvedChange === -1 &&
            prevQuestion.timeAssigned !== undefined &&
            prevQuestion.timeAddressed !== undefined
        ) {
            resolveTimeChange = prevQuestion.timeAssigned.seconds - prevQuestion.timeAddressed.seconds;
        }

        // Figure out who needs to be updated with a notification based on the changes
        const asker: FireUser = (await db.doc(`users/${newQuestion.askerId}`).get()).data() as FireUser;

        if (prevQuestion.answererId !== newQuestion.answererId && newQuestion.answererId !== "") {
            db.doc(`notificationTrackers/${asker.email}`)
                .update({
                    notificationList: admin.firestore.FieldValue.arrayUnion({
                        title: "TA Assigned",
                        subtitle: "TA Assigned",
                        message: "A TA has been assigned to your question",
                        createdAt: admin.firestore.Timestamp.now(),
                    }),
                })
                .catch(() => {
                    db.doc(`notificationTrackers/${asker.email}`).create({
                        id: asker.email,
                        notificationList: [
                            {
                                title: "TA Assigned",
                                subtitle: "TA Assigned",
                                message: "A TA has been assigned to your question",
                                createdAt: admin.firestore.Timestamp.now(),
                            },
                        ],
                        notifications: admin.firestore.Timestamp.now(),
                        productUpdates: admin.firestore.Timestamp.now(),
                        lastSent: admin.firestore.Timestamp.now(),
                    });
                });
        }

        if (prevQuestion.answererId !== newQuestion.answererId && newQuestion.answererId === "") {
            const session: FireSession = (await db.doc(`sessions/${sessionId}`).get()).data() as FireSession;
            db.doc(`notificationTrackers/${asker.email}`)
                .update({
                    notificationList: admin.firestore.FieldValue.arrayUnion({
                        title: "TA Unassigned",
                        subtitle: "TA Unassigned",
                        message: `A TA has been unassigned from your question and you have \
                  been readded to the top of the ${session.title} queue.`,
                        createdAt: admin.firestore.Timestamp.now(),
                    }),
                })
                .catch(() => {
                    db.doc(`notificationTrackers/${asker.email}`).create({
                        id: asker.email,
                        notificationList: [
                            {
                                title: "TA Unassigned",
                                subtitle: "TA Unassigned",
                                message: `A TA has been unassigned from your question and you have \
                  been readded to the top of the ${session.title} queue.`,
                                createdAt: admin.firestore.Timestamp.now(),
                            },
                        ],
                        notifications: admin.firestore.Timestamp.now(),
                        productUpdates: admin.firestore.Timestamp.now(),
                        lastSent: admin.firestore.Timestamp.now(),
                    });
                });
        } else if (newQuestion.status === "resolved") {
            const session: FireSession = (await db.doc(`sessions/${sessionId}`).get()).data() as FireSession;
            db.doc(`notificationTrackers/${asker.email}`)
                .update({
                    notificationList: admin.firestore.FieldValue.arrayUnion({
                        title: "Question resolved",
                        subtitle: "Question marked as resolved",
                        message: `A TA has marked your question as resolved and you \
                            have been removed from the ${session.title} queue`,
                        createdAt: admin.firestore.Timestamp.now(),
                    }),
                })
                .catch(() => {
                    db.doc(`notificationTrackers/${asker.email}`).create({
                        id: asker.email,
                        notificationList: [
                            {
                                title: "Question marked no-show",
                                subtitle: "Question marked as no-show",
                                message: `A TA has marked your question as no-show and you \
                            have been removed from the ${session.title} queue`,
                                createdAt: admin.firestore.Timestamp.now(),
                            },
                        ],
                        notifications: admin.firestore.Timestamp.now(),
                        productUpdates: admin.firestore.Timestamp.now(),
                        lastSent: admin.firestore.Timestamp.now(),
                    });
                });
        } else if (newQuestion.status === "no-show") {
            const session: FireSession = (await db.doc(`sessions/${sessionId}`).get()).data() as FireSession;
            db.doc(`notificationTrackers/${asker.email}`)
                .update({
                    notificationList: admin.firestore.FieldValue.arrayUnion({
                        title: "Question marked no-show",
                        subtitle: "Question marked as no-show",
                        message: `A TA has marked your question as no-show and you \
                            have been removed from the ${session.title} queue`,
                        createdAt: admin.firestore.Timestamp.now(),
                    }),
                })
                .catch(() => {
                    db.doc(`notificationTrackers/${asker.email}`).create({
                        id: asker.email,
                        notificationList: [
                            {
                                title: "Question marked no-show",
                                subtitle: "Question marked as no-show",
                                message: `A TA has marked your question as no-show and you \
                            have been removed from the ${session.title} queue`,
                                createdAt: admin.firestore.Timestamp.now(),
                            },
                        ],
                        notifications: admin.firestore.Timestamp.now(),
                        productUpdates: admin.firestore.Timestamp.now(),
                        lastSent: admin.firestore.Timestamp.now(),
                    });
                });
        }

        // Update relevant statistics in database
        return db.doc(`sessions/${sessionId}`).update({
            totalQuestions: admin.firestore.FieldValue.increment(numQuestionChange),
            assignedQuestions: admin.firestore.FieldValue.increment(numAssignedChange),
            resolvedQuestions: admin.firestore.FieldValue.increment(numResolvedChange),
            totalWaitTime: admin.firestore.FieldValue.increment(waitTimeChange),
            totalResolveTime: admin.firestore.FieldValue.increment(resolveTimeChange),
        });
    });

exports.onQuestionStatusUpdate = functions.firestore
    .document("questions/{questionId}")
    .onUpdate(async (change, context) => {
        const newQuestion = change.after.data();
        const prevQuestion = change.before.data();
        const questionId = context.params.questionId;

        if (prevQuestion.status !== "resolved" && newQuestion.status === "resolved") {
            const userId = newQuestion.askerId;

            // Retrieve the session document reference 
            const userDoc = db.doc(`users/${userId}`);

            // Update the resolvedQuestionsArray field in the user document if it exists
            return userDoc.update(
                {
                    // Keeps track of the most recent question that was resolved
                    // Object with questionId and askerId fields
                    // questionId: the id of the question that was resolved
                    // askerId: the id of the user who asked the question
                    recentlyResolvedQuestion: {
                        questionId,
                        askerId: userId,
                    }
                });
        }
        // If the question is not resolved yet, then we do nothing
        return null;
    });
    