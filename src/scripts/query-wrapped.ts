import admin from 'firebase-admin';

// Initialize Firebase Admin with credentials and database URL
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://queue-me-in-prod.firebaseio.com'
});

// Initialize Firestore database
const db = admin.firestore();

async function validateDocuments() {
    // Reference to the 'wrapped' collection
    const wrappedRef = db.collection('wrapped');

    try {
        // Get all documents in the collection
        const snapshot = await wrappedRef.get();

        // Print the total number of documents
        // eslint-disable-next-line no-console
        console.log(`Total number of documents in 'wrapped-fa24': ${snapshot.size}`);

        // Iterate over each document
        snapshot.forEach(doc => {
            const data = doc.data();
            const errors = [];

            // Check if numVisits is a positive number
            if (data.numVisits <= 0) {
                errors.push('numVisits is not positive');
            }

            // Check if personalityType is not an empty string
            if (!data.personalityType || data.personalityType.trim() === '') {
                errors.push('personalityType is empty');
            }

            // Check if totalMinutes is a positive number
            if (data.totalMinutes <= 0) {
                errors.push('totalMinutes is not positive');
            }

            // Check if favTa exists for students
            if (!data.timeHelpingStudents && data.numStudentsHelped === 0 && data.favTaId) {
                errors.push('favTaId is missing');
            }

            // If there are errors, log them with the user ID
            if (errors.length > 0) {
                // eslint-disable-next-line no-console
                console.log(`Document ID: ${doc.id} has the following issues: ${errors.join(', ')}`);
            }
        });
    } catch (error) {
        // Log any errors that occur during the fetch
        // eslint-disable-next-line no-console
        console.error('Error retrieving documents:', error);
    }
}

// Call the function to execute it
validateDocuments();
