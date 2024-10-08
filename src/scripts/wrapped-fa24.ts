import admin from "firebase-admin";

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://qmi-test.firebaseio.com'

});

// eslint-disable-next-line no-console
console.log('Firebase admin initialized!');

// Initialize Firestore
const db = admin.firestore();

// Firestore Timestamps for the query range
const startDate = admin.firestore.Timestamp.fromDate(new Date('2023-08-20'));
const endDate = admin.firestore.Timestamp.fromDate(new Date('2024-05-19'));

const getWrapped = async () => {
    // Refs
    const questionsRef = db.collection('questions');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sessionsRef = db.collection('sessions');
    const wrappedRef = db.collection('wrapped');
    const usersRef = db.collection('users');

    // Query all questions asked between FA23 and SP24
    const questionsSnapshot = await questionsRef
        .where('timeEntered', '>=', startDate)
        .where('timeEntered', '<=', endDate)
        .get();

    const userStats: { [userId: string]: {
        officeHourVisits: string[];
        totalMinutes: number;
        personalityType: string;
        timeHelpingStudents?: number;
    }} = {};

    const TAsessions: { [userId: string]: string[]} = {};

    for (const doc of questionsSnapshot.docs) {
        const question = doc.data() as {
            answererId: string;
            askerId: string;
            sessionId: string;
            timeEntered: admin.firestore.Timestamp;
            timeAddressed: admin.firestore.Timestamp | undefined;
        };

        const { answererId, askerId, sessionId, timeEntered, timeAddressed } = question;

        if (!userStats[askerId]) {
            userStats[askerId] = {
                officeHourVisits: [],
                totalMinutes: 0,
                personalityType: '',
            };
        }

        if (!userStats[answererId]) {
            userStats[answererId] = {
                officeHourVisits: [],
                totalMinutes: 0,
                personalityType: '',
                timeHelpingStudents: 0,
            };
        }

        // Office hour visits
        if (!userStats[askerId].officeHourVisits?.includes(sessionId)) {
            userStats[askerId].officeHourVisits?.push(sessionId);
        }

        // Minutes spent at office hours
        if (timeEntered) {
            if (timeAddressed) {
                const minutesSpent = (timeAddressed.toDate().getTime() - 
            timeEntered.toDate().getTime()) / 60000; // convert ms to minutes
                userStats[askerId].totalMinutes += minutesSpent;
            } else {
                userStats[askerId].totalMinutes += 60; // assume 60 minutes if not addressed
            }
        }

        if (!TAsessions[answererId]?.includes(sessionId)) {
            TAsessions[answererId]?.push(sessionId);
        }
    }

    // Personality type will be calculated after processing all documents
    

    // Process personality type
    for (const [, stats] of Object.entries(userStats)) {
        const sessionCount = stats.officeHourVisits.length;
        const weeksInRange = (endDate.toDate().getTime() - startDate.toDate().getTime())
        / (1000 * 60 * 60 * 24 * 7); // convert ms to weeks
        const averageSessionsPerWeek = sessionCount / weeksInRange;

        if (averageSessionsPerWeek >= 2) {
            stats.personalityType = 'Consistent';
        } else if (averageSessionsPerWeek >= 0.5) {
            stats.personalityType = 'Resourceful';
        } else {
            stats.personalityType = 'Independent';
        }
    }

    // Update the wrapped collection
    const batch = db.batch();

    Object.entries(userStats).forEach(async ([userId, stats]) => {
        if (userId) {
            const wrappedDocRef = wrappedRef.doc(userId);
            batch.set(wrappedDocRef, stats);

            const userDoc = await usersRef.doc(userId).get();
            if (userDoc.exists) {
                usersRef.doc(userId).update({
                    wrapped: true,
                });
            } else {
            // Handle the case where the document does not exist
            // eslint-disable-next-line no-console
                console.log(`No document found for user ID ${userId}, skipping update.`);
            }
        } else {
            // eslint-disable-next-line no-console
            console.log("User ID is undefined, skipping update.")
        }
       
    });

    await batch.commit();
}

(async () => {
    try {
        await getWrapped();
        // eslint-disable-next-line no-console
        console.log("Processing complete.");
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to update stats:", error);
    }
})();
