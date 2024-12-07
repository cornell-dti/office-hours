import { Resend } from 'resend';
import admin from "firebase-admin";
import * as dotenv from 'dotenv';

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://qmi-test.firebaseio.com'

});

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

/* Returns an array of email objects to send - should be at most 100 per day. 
totalEmails is 
batchSize should be 49 or less to maintain free emailing */
const createBatches =  (totalEmails: string[], batchSize: number) => {
    let i = 0;
    const emailObjs = [];
    if (batchSize > 49) {
        // eslint-disable-next-line no-console
        console.log("Batch size is too large. Must be no more than 49");
    }
    while (i < totalEmails.length && emailObjs.length <= 100) {

        emailObjs.push(
            {
                from: 'queuemein@cornelldti.org',
                to: ['ns848@cornell.edu'],
                bcc: totalEmails.slice(i, Math.min(i+batchSize, totalEmails.length)),
                subject: 'QMI testing batch ' + i + '!',
                html: '<strong>It works!</strong>'
            }
        )
        i+= batchSize;
    }
    if (emailObjs.length == 100) {
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
        // const data = await resend.batch.send(
        //     createBatches(userEmails, 49));

        const data = await resend.emails.send({
            from: 'queuemein@cornelldti.org',
            to: ['ns848@cornell.edu'],
            bcc: ['nidhisoma@gmail.com'],
            subject: 'QMI testing',
            html: '<strong>It works!</strong>'
        });

        // eslint-disable-next-line no-console
        console.log(data);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
})();