// Updates courses to include CS2110-sp-24 for all students who have asked questions in the course if they are not already enrolled in the course.
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

console.log('Firebase admin initialized!');

// Initialize Firestore
const db = admin.firestore();

async function updateStudents() {
    const sessionsRef = db.collection('sessions');
    const sessionsQuery = sessionsRef.where('courseId', '==', 'CS2110-sp-24');
    const sessionDocs = await sessionsQuery.get();

    if (sessionDocs.empty) {
        console.log("No matching sessions found.");
        return;
    }

    const sessionIds = sessionDocs.docs.map((doc) => doc.id);
    const chunkSize = 30;
    const askerIdsSet = new Set();

    for (let i = 0; i < sessionIds.length; i += chunkSize) {
        const chunk = sessionIds.slice(i, i + chunkSize);
        const questionsRef = db.collection('questions');
        const questionsQuery = questionsRef.where('sessionId', 'in', chunk);
        const questionDocs = await questionsQuery.get();

        questionDocs.forEach((doc) => {
            askerIdsSet.add(doc.data().askerId);
        });
    }

    const askerIds = Array.from(askerIdsSet);

    for (const askerId of askerIds) {
        const userRef = db.collection('users').doc(askerId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            const courses = userData.courses || [];
            if (!courses.includes('CS2110-sp-24')) {
                courses.push('CS2110-sp-24');
                await userRef.update({ courses });
                console.log(`Updated courses for user: ${askerId}`);
            }
        }
    }

    console.log('Courses updated successfully!');
} 

(async () => {
    try {
        await updateStudents();
    } catch (error) {
        console.error("Failed to update students:", error);
    }
})();
