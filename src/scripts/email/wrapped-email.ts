import { Resend } from 'resend';
import * as admin from "firebase-admin"
import 'dotenv/config'
import { HTML } from "./wrapped-html";
import { MAX_BATCH_LIMIT, MAX_EMAIL_LIMIT } from "../../constants";

/*

Credit to CoursePlan's email system for instructions to set this up.

This script uses the Resend API to send automated emails to users that can see Wrapped. 
At most, it can send 100 emails each as a batch with 49 recipients in a day.

If it's the first time running the script, you should run: node <script path> 0
This will start the script from the first email (0th index). 
If the 100 email limit has been hit, there will be a console statement that tells you the next input number to run the next day.

*/

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://queue-me-in-prod.firebaseio.com'

});

const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);

if (process.argv.length !== 3) {
    throw new Error("Usage: node <script path> <index number> . Use 0 if running script for first time")
} 
const indexStopped = process.argv[2];

/** Returns an array of email objects to send - should be at most 100 per day. 
 * totalEmails is a list of all the user emails to send to. 
 * batchSize should be 49 or less to maintain free emailing.
 * Throws an error if this pre-condition is violated. */
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
        // eslint-disable-next-line no-console
        // console.log("bcc list: " + totalEmails.slice(i, Math.min(i+batchSize, totalEmails.length)));
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

(async () => {
    // Getting user emails
    const usersRef = admin.firestore().collection('users');
    // eslint-disable-next-line no-console
    console.log('firebase worked');
    // using orderBy for email field to filter out users that don't have an email
    const usersSnapshot = await usersRef
        .where('wrapped', '==',true)
        .where('email', '!=', null)
        .orderBy('email')
        .get();

    const userEmails: string[] = await Promise.all(usersSnapshot.docs.map(async (doc) => {
        return doc.get('email'); 
    }
    ));
    // eslint-disable-next-line no-console
    console.log(userEmails);

    try {
        const data = await resend.batch.send(
            createBatches(userEmails, 49, 'Check Out Your QMI Wrapped!', HTML, indexStopped)
        );
    

        // eslint-disable-next-line no-console
        console.log("Emails have been sent!");
        // eslint-disable-next-line no-console
        console.log(data);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log("Emails have not been sent.");
        // eslint-disable-next-line no-console
        console.error(error);
    }
})();