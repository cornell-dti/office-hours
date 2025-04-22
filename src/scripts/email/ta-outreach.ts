import * as admin from "firebase-admin"
import { writeFileSync } from "fs";
import { Resend } from 'resend';
import { START_DATE, END_DATE, MAX_BATCH_LIMIT, MAX_EMAIL_LIMIT } from "../../constants";
import 'dotenv/config'

/*
If it's the first time running the script, you should run: node <script path> 0
This will start the script from the first email (0th index). If the 100 email limit has been hit, there will be a console statement that tells you the next input number to run the next day.
*/

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://queue-me-in-prod.firebaseio.com'
    // 'https://qmi-test.firebaseio.com'
    // 'https://queue-me-in-prod.firebaseio.com'

});

// eslint-disable-next-line no-console
console.log('Firebase admin initialized!');

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

/** Returns an array of email objects to send - should be at most 100 per day. 
- totalEmails is a list of all the user emails to send to. 
- batchSize should be 49 or less to maintain free emailing.
- Throws an error if this pre-condition is violated. */
/* Have to redefine this function from wrapped-email because using the exported version 
runs the other script and sends the other emails too. */
const createBatches =  (totalEmails: string[], batchSize: number, subj: string, content: string, startInd: string) => {
    let i = parseInt(startInd, 10);
    // eslint-disable-next-line no-console
    console.log(`starting from user ${i}: ${totalEmails[i]}`);
    const emailObjs = [];
    if (batchSize > MAX_BATCH_LIMIT) {
        throw new Error("Batch size is too large. Must be no more than 49");
    }
    if (totalEmails.length > MAX_BATCH_LIMIT * MAX_EMAIL_LIMIT) {
        // eslint-disable-next-line no-console
        console.log(
            // eslint-disable-next-line max-len
            `Total email length > ${MAX_BATCH_LIMIT * MAX_EMAIL_LIMIT}. Up to ${batchSize * MAX_EMAIL_LIMIT} emails will be sent, but you must run this script again the next day.`)
    }
    while (i < totalEmails.length && emailObjs.length < MAX_EMAIL_LIMIT) {

        emailObjs.push(
            {
                from: 'queuemein@cornelldti.org',
                // This is the dti address because recievers can see, but dti will not see recievers.
                to: ['hello@cornelldti.org'],
                bcc: totalEmails.slice(i, Math.min(i+batchSize, totalEmails.length)),
                subject: subj,
                html: content
            }
        )
        
        i+= batchSize;
    }
    if (emailObjs.length === MAX_EMAIL_LIMIT) {
        // eslint-disable-next-line no-console
        console.log(`Reached email limit of ${MAX_EMAIL_LIMIT} emails per day, stopped at:
             i=${i},  user ${totalEmails[i]}
Continue from this user the next day by typing "node ${process.argv[1]} ${i}"`)
    }
    return emailObjs;

}

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

    const allTaDataPromises = [];

    for (const doc of coursesSnapshot.docs) {
        const courseCode = doc.get('code');
        const taList:readonly string[] = doc.get('tas');

        const taDataPromises = taList.map(async (taId) => {
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
                /* Assuming you can't be a TA for two classes in the same semester, 
                so there should be no repeats. */       
                rowData += taDoc.firstName + " " + taDoc.lastName + ",";
                rowData += taDoc.email + "," + courseCode + "\n";
                taEmails.push(taDoc.email);
                taClasses.push(courseCode);
                taNames.push(taDoc.firstName + " " + taDoc.lastName);
                writeFileSync("./src/scripts/email/tas.csv", rowData, {
                    flag: "a"
                })
            }
        });
        
        allTaDataPromises.push(...taDataPromises);
    }

    await Promise.all(allTaDataPromises);
}

(async () => {
    try {
        await getTAs();
        // eslint-disable-next-line no-console
        console.log('Writing info to CSV...');
        // eslint-disable-next-line no-console
        console.log("Processing complete. Sending emails..");
        /* eslint-disable max-len */
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
            createBatches(taEmails, 49, "[Queue Me In] Provide Your TA Feedback", content, indexStopped)
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
