import admin from "firebase-admin";
import { writeFileSync } from "fs";
import { START_DATE, END_DATE } from "../constants";

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://queue-me-in-prod.firebaseio.com'
    //'https://qmi-test.firebaseio.com'
    // 'https://queue-me-in-prod.firebaseio.com'

});

// eslint-disable-next-line no-console
console.log('Firebase admin initialized!');

// eslint-disable-next-line no-console
console.log('fs initialized');

// Initialize Firestore
const db = admin.firestore();

// Firestore Timestamps for the query range. Will have to change to represent semester dates
const startDate = admin.firestore.Timestamp.fromDate(new Date(START_DATE));
const endDate = admin.firestore.Timestamp.fromDate(new Date(END_DATE));
writeFileSync("./src/scripts/tas.csv", "Name, Email, Courses\n", {
    flag: "w"
})

const getTAs = async () => {
    // Refs
    const coursesRef = db.collection('courses');
    const usersRef = db.collection('users');

    // Query the live courses between SP25
    const coursesSnapshot = await coursesRef
        .where('startDate', '>=', startDate)
        .where('endDate', '<=', endDate)
        .get();

    for (const doc of coursesSnapshot.docs) {
        const courses = doc.data() as {
            code: string;
            endDate: admin.firestore.Timestamp;
            name: string;
            queueOpenInterval: number;
            semester: string;
            startDate: admin.firestore.Timestamp;
            professors: readonly string[];
            tas: readonly string[];
            courseId: string;
            charLimit: number;
            term: string;
            year: string;
            timeLimit?: number;
            timeWarning?: number;
            isTimeLimit?: boolean;
            feedbackList?: admin.firestore.FieldValue;
        };

        courses.tas.forEach(async (taId) => {
            let rowData = "";
            const taDoc = (await usersRef.doc(taId).get()).data() as {
                firstName: string;
                lastName: string;
                photoUrl: string;
                userId: string;
                email: string;
                courses: readonly string[];
                roles: { readonly [courseId: string]: admin.firestore.FieldValue | undefined };
                phoneNumber?: string;
                textNotifsEnabled?: boolean;
                textPrompted?: boolean;
                wrapped?: boolean;
                recentlyResolvedQuestion?: admin.firestore.FieldValue;
            };
            if (taDoc){      
                // eslint-disable-next-line no-console
                //console.log(taDoc.roles); 
                /*Assuming you can't be a TA for two classes in the same semester, 
                so there should be no repeats.*/       
                rowData += taDoc.firstName + " " + taDoc.lastName + ",";
                rowData += taDoc.email + "," + courses.code + "\n";
                writeFileSync("./src/scripts/tas.csv", rowData, {
                    flag: "a"
                })
            }
        })
    }
}

(async () => {
    try {
        await getTAs();
        // eslint-disable-next-line no-console
        console.log("Processing complete.");
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to get TA emails:", error);
    }
})();
