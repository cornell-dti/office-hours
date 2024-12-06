import { Resend } from 'resend';
import admin from "firebase-admin";
import * as dotenv from 'dotenv';

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://qmi-test.firebaseio.com'

});

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

const createBatches =  (totalEmails: string[], batchSize: number) => {
    let i = 0;
    const emailObjs = [];
    while (i < totalEmails.length) {

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

    // TODO: Creating batch chunks - max limit of 49 for each batch
    // TODO: Ensure we never exceed the 100 emails per day limit
    //alternate structure, could use resend.batch.send with arrray of data
    try {
        //ALT:
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