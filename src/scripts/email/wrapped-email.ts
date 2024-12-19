import { Resend } from 'resend';
import admin from "firebase-admin";
import * as dotenv from 'dotenv';
import { HTML } from "./wrapped-html";

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://qmi-test.firebaseio.com'

});

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

// DO NOT SEND TO ACTUAL PROD YET YOU HAVENT CHANGED SUBJECT LINE

/** Returns an array of email objects to send - should be at most 100 per day. 
- totalEmails is a list of all the user emails to send to. 
- batchSize should be 49 or less to maintain free emailing.
- Throws an error if this pre-condition is violated. */
const createBatches =  (totalEmails: string[], batchSize: number) => {
    let i = 0;
    const emailObjs = [];
    if (batchSize > 49) {
        throw new Error("Batch size is too large. Must be no more than 49");
    }
    while (i < totalEmails.length && emailObjs.length <= 100) {

        emailObjs.push(
            {
                from: 'queuemein@cornelldti.org',
                // make below the dti address or something cause recievers can see
                // but dti will not see recievers
                to: ['ns848@cornell.edu'],
                bcc: totalEmails.slice(i, Math.min(i+batchSize, totalEmails.length)),
                subject: 'Check Out Your QMI Wrapped! : batch ' + i,
                html: HTML
            }
        )
        i+= batchSize;
    }
    if (emailObjs.length === 100) {
        // eslint-disable-next-line no-console
        console.log("Reached email limit of 100 emails per day.")
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
        .orderBy('email')
        .get();

    const userEmails: string[] = await Promise.all(usersSnapshot.docs.map(async (doc) => {
        return doc.get('email'); 
    }
    ));
    // eslint-disable-next-line no-console
    console.log(userEmails);

    // alternate structure, could use resend.batch.send with arrray of data
    try {
        // ALT:
        const data = await resend.batch.send(
            createBatches(["nidhisoma@gmail.com"], 49));

        // const data = await resend.emails.send({
        //     from: 'queuemein@cornelldti.org',
        //     to: ['ns848@cornell.edu'],
        //     bcc: ['nidhisoma@gmail.com'],
        //     subject: 'Check Out Your QMI Wrapped!',
        //     html: HTML
        // });
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