import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
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
    const sessionsRef = db.collection('sessions');
    const usersRef = db.collection('users');
    const wrappedRef = db.collection('wrapped');

    // Query all questions asked between FA23 and SP24
    const questionsSnapshot = await questionsRef
        .where('timeEntered', '>=', startDate)
        .where('timeEntered', '<=', endDate)
        .get();

    const userStats = {};

    for (const doc of questionsSnapshot.docs) {
        const question = doc.data();
        const { askerId, sessionId, timeEntered, timeAddressed } = question;

        if (!userStats[askerId]) {
            userStats[askerId] = {
                officeHourVisits: [],
                totalMinutes: 0,
                // Initialize other necessary properties...
            };
        }

        // Office hour visits
        if (!userStats[askerId].officeHourVisits.includes(sessionId)) {
            userStats[askerId].officeHourVisits.push(sessionId);
        }

        // Minutes spent at office hours
        if (timeAddressed && timeEntered) {
            const minutesSpent = (timeAddressed.toDate() - timeEntered.toDate()) / 60000; // convert ms to minutes
            userStats[askerId].totalMinutes += minutesSpent;
        }

        // Personality type will be calculated after processing all documents
    }

    // Process personality type
    for (const [userId, stats] of Object.entries(userStats)) {
        const sessionCount = stats.officeHourVisits.length;
        const weeksInRange = endDate.toDate() - startDate.toDate() / (1000 * 60 * 60 * 24 * 7); // convert ms to weeks
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

    Object.entries(userStats).forEach(([userId, stats]) => {
        const wrappedDocRef = wrappedRef.doc(userId);
        batch.set(wrappedDocRef, stats);
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
