import { MailtrapClient } from 'mailtrap';

export const sendEmailInvite = (email: string) => {

    const client = new MailtrapClient({ token: process.env.MAILTRAP_TOKEN as string });
    const sender = {
        email: "mailtrap@queueme.in",
        name: "QueueMeIn Team"
    }
    const recipient = [{
        email
    }]

    client.send({
        from: sender,
        to: recipient,
        subject: "You've been invited to QueueMeIn!",
        text: "You've been invited to QueueMeIn! Click here to sign up: https://queueme.in",
        category: "QMI Invite – Test",
    })

}
