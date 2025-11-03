// eslint-disable-next-line import/no-unresolved
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { Twilio } from "twilio";
import moment from "moment-timezone";

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
async function sendSMS(user: FireUser, message: string) {
    if (process.env.DATABASE === "staging") {
        return;
    }
    const userPhone = user.phoneNumber;
    if (userPhone === "Dummy number" || userPhone === undefined) return;
    try {
        await client.messages
            .create({
                from: twilioNumber,
                to: userPhone,
                body: `[QueueMeIn] ${message}`.replace(/\s+/g, " "),
            })
            .then((msg) => {
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
exports.onUserCreate = functions.firestore.document("users/{userId}").onCreate(async (snap, context) => {
    const userId = context.params.userId;

    // get the user doc
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    const user = userDoc.data() as FireUser;

    const currentRoles = user.roles;
    const email = user.email;

    // match this email with a user in the pendingUsers collection
    const pendingUsersSnap = await db.collection("pendingUsers").where("email", "==", email).get();

    pendingUsersSnap.forEach(async (doc) => {
        // delete the pendingUsers entry because they now exist in QMI...
        await db.collection("pendingUsers").doc(doc.id).delete();

        // get the users's roles map as a Map<string, FireCourseRole>
        const newRoles = (doc.data() as FirePendingUser).roles;
        const taCourseIds: string[] = [];
        const profCourseIds: string[] = [];

        for (const [courseId, role] of Object.entries(newRoles)) {
            if (role === "ta") {
                taCourseIds.push(courseId);
            } else if (role === "professor") {
                profCourseIds.push(courseId);
            }
        }

        const batch = db.batch();

        // and update the newly-created user with their new roles
        userRef.update({
            courses: [...taCourseIds, ...profCourseIds],
            roles: { ...currentRoles, ...newRoles },
        });

        const taCourseDocs = await Promise.all(
            taCourseIds.map((courseId) => db.collection("courses").doc(courseId).get())
        );

        const profCourseDocs = await Promise.all(
            profCourseIds.map((courseId) => db.collection("courses").doc(courseId).get())
        );
        taCourseDocs.forEach((taDoc, index) => {
            if (!taDoc.exists) {
                functions.logger.error("ta course doc does not exist.");
            }

            const courseId = taCourseIds[index];

            // const course = doc.data() as FireCourse;
            batch.update(db.collection("courses").doc(courseId), {
                tas: admin.firestore.FieldValue.arrayUnion(userId),
            });
        });

        profCourseDocs.forEach((pfDoc, index) => {
            if (!pfDoc.exists) {
                functions.logger.error("prof course doc does not exist.");
            }

            const courseId = profCourseIds[index];
            // const course = doc.data() as FireCourse;
            batch.update(db.collection("courses").doc(courseId), {
                professors: admin.firestore.FieldValue.arrayUnion(userId),
            });
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
        if (askerId === commenterId && answererId !== "") {
            const answerer: FireUser = (await db.doc(`users/${answererId}`).get()).data() as FireUser;
            db.doc(`notificationTrackers/${answerer.email}`)
                .update({
                    notificationList: admin.firestore.FieldValue.arrayUnion({
                        title: "Student comment",
                        subtitle: "New student comment",
                        message: `${asker.firstName} commented \
                        on your assigned question`.trim(),
                        createdAt: admin.firestore.Timestamp.now(),
                    }),
                })
                .catch(() => {
                    db.doc(`notificationTrackers/${answerer.email}`).create({
                        id: answerer.email,
                        notificationList: [
                            {
                                title: "Student comment",
                                subtitle: "New student comment",
                                message: `${asker.firstName} commented \
                        on your assigned question`.trim(),
                                createdAt: admin.firestore.Timestamp.now(),
                            },
                        ],
                        notifications: admin.firestore.Timestamp.now(),
                        productUpdates: admin.firestore.Timestamp.now(),
                        lastSent: admin.firestore.Timestamp.now(),
                    });
                });
        } else {
            db.doc(`notificationTrackers/${asker.email}`)
                .update({
                    notificationList: admin.firestore.FieldValue.arrayUnion({
                        title: "TA comment",
                        subtitle: "New TA comment",
                        message: `A TA commented on your question`.trim(),
                        createdAt: admin.firestore.Timestamp.now(),
                    }),
                })
                .catch(() => {
                    db.doc(`notificationTrackers/${asker.email}`).create({
                        id: asker.email,
                        notificationList: [
                            {
                                title: "TA comment",
                                subtitle: "New TA comment",
                                message: `A TA commented on your question`.trim(),
                                createdAt: admin.firestore.Timestamp.now(),
                            },
                        ],
                        notifications: admin.firestore.Timestamp.now(),
                        productUpdates: admin.firestore.Timestamp.now(),
                        lastSent: admin.firestore.Timestamp.now(),
                    });
                });
        }
    });

exports.onSessionUpdate = functions.firestore.document("sessions/{sessionId}").onUpdate(async (change) => {
    try {
        functions.logger.info("onSessionUpdate: Starting function execution");
        
        const before = change.before.data() as FireSession;
        const after = change.after.data() as FireSession;
        const sessionId = change.after.id;

        functions.logger.info(
            `onSessionUpdate triggered for session ${sessionId} ` +
            `(totalWaitTime: ${before.totalWaitTime} -> ${after.totalWaitTime}, ` +
            `assignedQuestions: ${before.assignedQuestions} -> ${after.assignedQuestions}, ` +
            `resolvedQuestions: ${before.resolvedQuestions} -> ${after.resolvedQuestions})`
        );

        // Wait time processing is now handled by onQuestionUpdate based on question entry times
        // This ensures waitTimeMap uses the correct time slot (when student entered queue)
        // instead of session start time, preventing conflicts between the two update paths

        // retrieve session id and ordered queue of active questions
        const afterSessionId = change.after.id;
        functions.logger.info(`onSessionUpdate: Querying questions for sessionId: ${afterSessionId}`);
        
        let afterQuestions;
        try {
            afterQuestions = (
                await db
                    .collection("questions")
                    .where("sessionId", "==", afterSessionId)
                    .where("status", "in", ["assigned", "unresolved"])
                    .orderBy("timeEntered", "asc")
                    .get()
            ).docs;
            functions.logger.info(`onSessionUpdate: Found ${afterQuestions.length} active questions`);
        } catch (queryError) {
            functions.logger.error("onSessionUpdate: Error querying questions", {
                sessionId: afterSessionId,
                error: queryError instanceof Error ? queryError.message : String(queryError),
                stack: queryError instanceof Error ? queryError.stack : undefined,
            });
            throw queryError;
        }

        const sessionName: string | undefined = after.title;
        functions.logger.info(`onSessionUpdate: Session name: ${sessionName || "undefined"}`);

        // Guard against empty active questions to prevent runtime errors
        if (afterQuestions.length > 0) {
            const topQuestionDoc = afterQuestions[0];
            if (!topQuestionDoc || !topQuestionDoc.exists) {
                functions.logger.warn("onSessionUpdate: Top question document does not exist");
                return;
            }

            const topQuestion: FireQuestion = topQuestionDoc.data() as FireQuestion;
            functions.logger.info(
                `onSessionUpdate: Top question ID: ${topQuestionDoc.id}, ` +
                `wasNotified: ${topQuestion.wasNotified}`
            );

            // if the top active question was not notified, notify them
            if (!topQuestion.wasNotified) {
                try {
                    if (!topQuestion.askerId) {
                        functions.logger.error("onSessionUpdate: Top question has no askerId", {
                            questionId: topQuestionDoc.id,
                        });
                        return;
                    }

                    functions.logger.info(`onSessionUpdate: Fetching user data for askerId: ${topQuestion.askerId}`);
                    const askerDoc = await db.doc(`users/${topQuestion.askerId}`).get();
                    
                    if (!askerDoc || !askerDoc.exists) {
                        functions.logger.error("onSessionUpdate: User document does not exist", {
                            askerId: topQuestion.askerId,
                            questionId: topQuestionDoc.id,
                        });
                        return;
                    }

                    const asker: FireUser = askerDoc.data() as FireUser;
                    if (!asker || !asker.email) {
                        functions.logger.error("onSessionUpdate: User data is invalid or missing email", {
                            askerId: topQuestion.askerId,
                            questionId: topQuestionDoc.id,
                        });
                        return;
                    }

                    functions.logger.info(`onSessionUpdate: Sending SMS to user: ${asker.email}`);
                    try {
                        const smsMessage = `Your question has reached the top of the ` +
                            `${sessionName || "queue"} queue. A TA will likely help you shortly.`;
                        await sendSMS(asker, smsMessage);
                    } catch (smsError) {
                        functions.logger.error("onSessionUpdate: Error sending SMS", {
                            askerEmail: asker.email,
                            error: smsError instanceof Error ? smsError.message : String(smsError),
                        });
                        // Continue execution even if SMS fails
                    }

                    functions.logger.info(
                        `onSessionUpdate: Updating notification tracker for: ${asker.email}`
                    );
                    const queueName = sessionName || "queue";
                    const notificationSubtitle = `Your question has reached the top of the ${queueName} queue.`;
                    const notificationMessage = `${notificationSubtitle} A TA will likely help you shortly.`;
                    await db.doc(`notificationTrackers/${asker.email}`)
                        .update({
                            notificationList: admin.firestore.FieldValue.arrayUnion({
                                title: "Your Question is Up!",
                                subtitle: notificationSubtitle,
                                message: notificationMessage,
                                createdAt: admin.firestore.Timestamp.now(),
                            }),
                        })
                        .catch(async () => {
                            functions.logger.info(
                                `onSessionUpdate: Notification tracker doesn't exist, ` +
                                `creating new one for: ${asker.email}`
                            );
                            try {
                                await db.doc(`notificationTrackers/${asker.email}`).create({
                                    id: asker.email,
                                    notificationList: [
                                        {
                                            title: "Your Question is Up!",
                                            subtitle: notificationSubtitle,
                                            message: notificationMessage,
                                            createdAt: admin.firestore.Timestamp.now(),
                                        },
                                    ],
                                    notifications: admin.firestore.Timestamp.now(),
                                    productUpdates: admin.firestore.Timestamp.now(),
                                    lastSent: admin.firestore.Timestamp.now(),
                                });
                            } catch (createError) {
                                functions.logger.error("onSessionUpdate: Error creating notification tracker", {
                                    askerEmail: asker.email,
                                    error: createError instanceof Error ? createError.message : String(createError),
                                });
                            }
                        });

                    functions.logger.info(`onSessionUpdate: Marking question as notified: ${topQuestionDoc.id}`);
                    await db.doc(`questions/${topQuestionDoc.id}`).update({
                        wasNotified: true,
                    });
                    functions.logger.info("onSessionUpdate: Successfully completed notification process");
                } catch (notificationError) {
                    const errorMessage = notificationError instanceof Error
                        ? notificationError.message
                        : String(notificationError);
                    const errorStack = notificationError instanceof Error
                        ? notificationError.stack
                        : undefined;
                    functions.logger.error("onSessionUpdate: Error in notification process", {
                        questionId: topQuestionDoc.id,
                        error: errorMessage,
                        stack: errorStack,
                    });
                    throw notificationError;
                }
            } else {
                functions.logger.info("onSessionUpdate: Top question was already notified, skipping");
            }
        } else {
            functions.logger.info("onSessionUpdate: No active questions found, exiting");
        }
        
        functions.logger.info("onSessionUpdate: Function execution completed successfully");
    } catch (error) {
        functions.logger.error("onSessionUpdate: Unhandled error in function", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            sessionId: change.after.id,
        });
        // Re-throw to ensure Firebase Functions logs the error
        throw error;
    }
});

exports.onQuestionCreate = functions.firestore.document("questions/{questionId}").onCreate(async (snap) => {
    // Get data object and obtain session/course
    const data = snap.data();
    const sessionId = data.sessionId;
    const session = (await db.collection("sessions").doc(sessionId).get()).data() as FireSession;
    const course = (await db.collection("courses").doc(session.courseId).get()).data() as FireCourse;

    // Increment total number of questions of relevant session
    const increment = admin.firestore.FieldValue.increment(1);

    // Add new question notification for all TAs
    course.tas.forEach(async (ta) => {
        const user: FireUser = (await db.doc(`users/${ta}`).get()).data() as FireUser;
        db.doc(`notificationTrackers/${user.email}`)
            .update({
                notificationList: admin.firestore.FieldValue.arrayUnion({
                    title: "New Question",
                    subtitle: `A new question has been added to the ${session.title} queue`,
                    message: `A new question has been added to the ${session.title} queue`,
                    createdAt: admin.firestore.Timestamp.now(),
                }),
            })
            .catch(() => {
                db.doc(`notificationTrackers/${user.email}`).create({
                    id: user.email,
                    notificationList: [
                        {
                            title: "New Question",
                            subtitle: `A new question has been added to the ${session.title} queue`,
                            message: `A new question has been added to the ${session.title} queue`,
                            createdAt: admin.firestore.Timestamp.now(),
                        },
                    ],
                    notifications: admin.firestore.Timestamp.now(),
                    productUpdates: admin.firestore.Timestamp.now(),
                    lastSent: admin.firestore.Timestamp.now(),
                });
            });
    });

    // Add new question notification for all Professors
    course.professors.forEach(async (professor) => {
        const user: FireUser = (await db.doc(`users/${professor}`).get()).data() as FireUser;
        db.doc(`notificationTrackers/${user.email}`)
            .update({
                notificationList: admin.firestore.FieldValue.arrayUnion({
                    title: "New Question",
                    subtitle: `A new question has been added to the ${session.title} queue`,
                    message: `A new question has been added to the ${session.title} queue`,
                    createdAt: admin.firestore.Timestamp.now(),
                }),
            })
            .catch(() => {
                db.doc(`notificationTrackers/${user.email}`).create({
                    id: user.email,
                    notificationList: [
                        {
                            title: "New Question",
                            subtitle: `A new question has been added to the ${session.title} queue`,
                            message: `A new question has been added to the ${session.title} queue`,
                            createdAt: admin.firestore.Timestamp.now(),
                        },
                    ],
                    notifications: admin.firestore.Timestamp.now(),
                    productUpdates: admin.firestore.Timestamp.now(),
                    lastSent: admin.firestore.Timestamp.now(),
                });
            });
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

exports.onQuestionUpdate = functions.firestore.document("questions/{questionId}").onUpdate(async (change) => {
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
    const newNumbers = questionStatusNumbers.get(newStatus) ?? 
        [0, 0, 0];
    const prevNumbers = questionStatusNumbers.get(prevStatus) ?? 
        [0, 0, 0];

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
    if (numResolvedChange === 1 && newQuestion.timeAssigned !== 
        undefined && newQuestion.timeAddressed !== undefined) {
        resolveTimeChange = newQuestion.timeAddressed.seconds - newQuestion.timeAssigned.seconds;
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
    const sessionRef = db.doc(`sessions/${sessionId}`);
    
    // Update session statistics
    await sessionRef.update({
        totalQuestions: admin.firestore.FieldValue.increment(numQuestionChange),
        assignedQuestions: admin.firestore.FieldValue.increment(numAssignedChange),
        resolvedQuestions: admin.firestore.FieldValue.increment(numResolvedChange),
        totalWaitTime: admin.firestore.FieldValue.increment(waitTimeChange),
        totalResolveTime: admin.firestore.FieldValue.increment(resolveTimeChange),
    });
    
    // Additionally update waitTimeMap using the question's timeEntered to choose the slot (America/New_York)
    if (waitTimeChange !== 0) {
        try {
            const tz = 'America/New_York';
            const sessionSnap = await db.doc(`sessions/${sessionId}`).get();
            const sessionForCourse = sessionSnap.data() as FireSession;
            const courseId = sessionForCourse.courseId;

            // Choose the student's entry time for slotting; fall back to previous if undefined
            const entryTs = (newQuestion.timeEntered ?? prevQuestion.timeEntered);
            if (entryTs) {
                const entryDate = entryTs.toDate();
                const m = moment.tz(entryDate, tz);
                const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                const weekday = dayNames[(m.day() + 6) % 7];
                const minute = Math.floor(m.minute() / 30) * 30;
                const slot = m.clone().minute(minute).second(0).millisecond(0);
                const timeSlotStr = slot.format('h:mm A');

                // Load course waitTimeMap
                const courseRef = db.doc(`courses/${courseId}`);
                const courseDoc = await courseRef.get();
                const courseData = courseDoc.data() as any;
                const waitTimeMap = courseData?.waitTimeMap || {};
                if (!waitTimeMap[weekday]) waitTimeMap[weekday] = {};

                const prevSec: number = waitTimeMap[weekday][timeSlotStr] || 0;
                const deltaSec = Math.abs(waitTimeChange); // ensure positive contribution
                const newAvg = prevSec === 0 ? deltaSec : Math.round(prevSec * 0.8 + deltaSec * 0.2);
                waitTimeMap[weekday][timeSlotStr] = newAvg;

                await courseRef.update({ waitTimeMap });
                functions.logger.info(
                    `✓ Updated waitTimeMap via onQuestionUpdate: ${weekday} ${timeSlotStr} = ${deltaSec}s, ` +
                    `new avg = ${waitTimeMap[weekday][timeSlotStr]}s`
                );
            }
        } catch (err) {
            functions.logger.error('Error updating waitTimeMap from onQuestionUpdate', err as Error);
        }
    }

    // Wait time processing at session level is handled by onSessionUpdate whenever totalWaitTime changes
});

exports.onQuestionStatusUpdate = functions.firestore
    .document("questions/{questionId}")
    .onUpdate(async (change, context) => {
        const newQuestion = change.after.data();
        const prevQuestion = change.before.data();
        const questionId = context.params.questionId;

        if (prevQuestion.status !== "resolved" && newQuestion.status === "resolved") {
            const userId = newQuestion.askerId;

            // Retrieve the user document reference
            const userDoc = db.doc(`users/${userId}`);

            // Update the resolvedQuestionsArray field in the user document if it exists
            return userDoc.update({
                // Keeps track of the most recent question that was resolved
                // Object with questionId and askerId fields
                // questionId: the id of the question that was resolved
                // askerId: the id of the user who asked the question
                recentlyResolvedQuestion: {
                    questionId,
                    askerId: userId,
                },
            });
        }
        // If the question is not resolved yet, then we do nothing
        return null;
    });

exports.onStudentJoinSession = functions.firestore
    .document("sessions/{sessionId}")
    .onUpdate(async (change, context) => {
        const beforeData = change.before.data();
        const afterData = change.after.data();
        const sessionId = context.params.sessionId;

        const beforeStudents = beforeData.totalQuestions - beforeData.resolvedQuestions;
        const afterStudents = afterData.totalQuestions - afterData.resolvedQuestions;

        const beforeTAs = beforeData.tas.length;
        const afterTAs = afterData.tas.length;

        // If number of students in queue and number of TAs in session have not changed, do nothing
        // Exit early
        if (beforeStudents === afterStudents && beforeTAs === afterTAs) {
            return null;
        }

        // Get the session reference
        const sessionRef = db.doc(`sessions/${sessionId}`);

        // Get the number of TAs in the session
        const numberOfTAs = afterData.tas.length;

        // If no TAs, set ratio to -1 to indicate that there are no TAs
        // Since there are no TAs, we don't have enough information to determine the ratio
        // If there are still unresolved questions, set hasUnresolvedQuestion to true
        // Otherwise, set it to false
        if (numberOfTAs === 0) {
            return db.doc(`sessions/${sessionId}`).update({
                studentPerTaRatio: -1,
                hasUnresolvedQuestion: afterStudents > 0,
            });
        }
        const ratio = afterStudents / numberOfTAs;

        // Update when the ratio has changed
        // If there are still unresolved questions, set hasUnresolvedQuestion to true
        // Otherwise, set it to false
        return sessionRef.update({
            studentPerTaRatio: ratio,
            hasUnresolvedQuestion: afterStudents > 0,
        });
    });
