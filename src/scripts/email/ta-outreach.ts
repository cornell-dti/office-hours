import * as admin from "firebase-admin"
import { writeFileSync } from "fs";
import { START_DATE, END_DATE, MAX_BATCH_LIMIT, MAX_EMAIL_LIMIT } from "../../constants";
import { Resend } from 'resend';
import { createBatches } from "./wrapped-email"
import 'dotenv/config'

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://queue-me-in-prod.firebaseio.com'
    //'https://qmi-test.firebaseio.com'
    // 'https://queue-me-in-prod.firebaseio.com'

});

// eslint-disable-next-line no-console
console.log('Firebase admin initialized from wrapped-email!');

const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);
// eslint-disable-next-line no-console
console.log('Resend initialized!')
if (process.argv.length !== 3) {
    throw new Error("Usage: node <script path> <index number> . Use 0 if running script for first time")
} 
const indexStopped = process.argv[2];

// Initialize Firestore
const db = admin.firestore();

// Firestore Timestamps for the query range. Will have to change to represent semester dates
const startDate = admin.firestore.Timestamp.fromDate(new Date(START_DATE));
const endDate = admin.firestore.Timestamp.fromDate(new Date(END_DATE));
writeFileSync("./src/scripts/email/tas.csv", "Name, Email, Courses\n", {
    flag: "w"
})

const taEmails:string[] = []
const taNames:string[] = []
const taClasses:string[] = []

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
        const courseCode = doc.get('code');
        const taList:readonly string[] = doc.get('tas');
        
        for (const taId of taList) {
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
                /*Assuming you can't be a TA for two classes in the same semester, 
                so there should be no repeats.*/       
                rowData += taDoc.firstName + " " + taDoc.lastName + ",";
                rowData += taDoc.email + "," + courseCode + "\n";
                taEmails.push(taDoc.email);
                taClasses.push(courseCode);
                taNames.push(taDoc.firstName + " " + taDoc.lastName);
                writeFileSync("./src/scripts/email/tas.csv", rowData, {
                    flag: "a"
                })
            }
        }
    }
}

(async () => {
    try {
        await getTAs();
        console.log('Writing info to CSV...');
        // eslint-disable-next-line no-console
        console.log("Processing complete. Sending emails..");
        const content = `
Hi there,
<br><br>
I hope this email finds you well! My name is Maddie and I am Queue Me In’s Product Marketing Manager. I am reaching out to ask if you could provide feedback on your experience using Queue Me In as a TA. Please share with us your thoughts using <a href="https://docs.google.com/forms/d/e/1FAIpQLSdDv1hHnVefUVZXqKobxMZZa1JrobwTY6oIMhcszxE3OYVBdg/viewform">this Google Form</a>. Your feedback is extremely valuable as we will use it to create and optimize features that help streamline your user experience. The form itself isn’t very long and should take approximately 10 minutes to complete.
<br><br>
<strong>Filling out this form will enter you in a raffle to win one of 2 $20 Amazon e-gift cards!</strong> To enter, please be sure to submit before April 21st at 11:59PM EST.
<br><br>
Thank you in advance for your feedback. We really appreciate your time!
<br><br>
If you have any questions, comments, or concerns, please reach out to me at mh2535@cornell.edu.
<br><br>
Best,
<br><br>
Maddie Hsia
        `
        const data = await resend.batch.send(
            createBatches(['ns848@cornell.edu', 'nidhisoma@gmail.com'], 1, "[Queue Me In] Provide Your TA Feedback", content, indexStopped)
        );

        // eslint-disable-next-line no-console
        console.log("Emails have been sent!");
        // eslint-disable-next-line no-console
        console.log(data);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to process:", error);
    }
})();
