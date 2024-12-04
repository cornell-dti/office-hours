// import { Resend } from 'resend';
import admin from "firebase-admin";

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://qmi-test.firebaseio.com'

});

// i think api key goes in here
// const resend = new Resend('re_123456789');

(async () => {
    // Getting user emails
    const usersRef = admin.firestore().collection('users');
    // eslint-disable-next-line no-console
    console.log('firebase worked');
    const usersSnapshot = await usersRef
        .where('wrapped', '==',true)
        .get();
    
    const userEmails: string[] = await Promise.all(usersSnapshot.docs.map(async (doc) => {
        return doc.get('email');
    }
    ));
    // eslint-disable-next-line no-console
    console.log(userEmails);

    // Creating batch chunks - max limit of 49 for each batch
    // try {
    //     const data = await resend.emails.send({
    //         from: 'Acme <onboarding@resend.dev>',
    //         to: ['delivered@resend.dev'],
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