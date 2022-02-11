import addNotification from 'react-push-notification';
import {addDBNotification} from '../firebasefunctions/notifications';

export const addNotificationWrapper = (
    user: FireUser, 
    title: string, 
    subtitle: string, 
    message: string | undefined
): void => {
    addDBNotification(user, {title, subtitle, message: `${message}`});

    // Attempt to send text message so long as the user has set up text message notifs
    try {
        const data : SMSRequest = {
            'userPhone' : user.phoneNumber as string,
            'message': message as string
        };

        if (user.phoneNumber === "Dummy number")
            throw("Hasn't set phone number");
        
        fetch("https://us-central1-qmi-test.cloudfunctions.net/sendSMSNotif/", {
            method: "POST",
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => console.log(res.json()))
    } catch (err) {console.log("error: " + err)}

    try {
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
