// import { Resend } from 'resend';
import admin from "firebase-admin";

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://qmi-test.firebaseio.com'

});

// i think api key goes in here (below is not a real one)
// const resend = new Resend('re_123456789');
const createBatches =  (totalEmails: string[], batchSize: number) => {


}

(async () => {
    // Getting user emails
    const usersRef = admin.firestore().collection('users');
    // eslint-disable-next-line no-console
    console.log('firebase worked');
    // using orderBy for email ensure that an email exists
    
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
    // TODO: look more into resend api idk what's frree so once i make account:
    // https://resend.com/docs/api-reference/emails/send-batch-emails
    // try {
    //     const data = await resend.emails.send({
    //         from: 'Acme <onboarding@resend.dev>',
    //         to: ['delivered@resend.dev'],
    //         bcc: 
    //         subject: 'QMI testing',
    //         html: '<strong>It works!</strong>'
    //     });

    //     // eslint-disable-next-line no-console
    //     console.log(data);
    // } catch (error) {
    //     // eslint-disable-next-line no-console
    //     console.error(error);
    // }
})();