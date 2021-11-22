import addNotification from 'react-push-notification';
import { Twilio } from "twilio";
import { addDBNotification } from '../firebasefunctions/notifications';

// TODO: Change to dotenv, this is only here for testing
const accountSid = "insert here...";
const authToken = "insert here...";
const twilioNumber = "insert here...";
// TODO: Receiver number should be changed to receiver's number
const receiver = "insert here...";

// const client = new Twilio(accountSid, authToken);

export const addNotificationWrapper = (
    user: FireUser,
    title: string,
    subtitle: string,
    message: string | undefined
): void => {
    addDBNotification(user, { title, subtitle, message: `${message}` })
    try {
        // client.messages
        //     .create({
        //         from: twilioNumber,
        //         to: receiver,
        //         body: message,
        //     })
        //     .then((message) => console.log(message.sid));

        addNotification({
            title,
            subtitle,
            message: `${message}`,
            theme: "darkblue",
            native: true
        });
    } catch (error) {
        // TODO(ewlsh): Handle this better, this notification library doesn't handle iOS
    }
}
