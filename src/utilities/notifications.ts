import addNotification from 'react-push-notification';
import {addDBNotification} from '../firebasefunctions/notifications'

export const addNotificationWrapper = (
    user: FireUser, 
    title: string, 
    subtitle: string, 
    message: string | undefined
): void => {
    addDBNotification(user, {title, subtitle, message: `${message}`})
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
