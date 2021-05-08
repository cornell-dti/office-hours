import firebase from 'firebase/app';
import { firestore } from '../firebase';

export const addNotification = (user : FireUser, notification : Omit<SessionNotification, "notificationId" | "createdAt">, notifList : SessionNotification[]) => {
    if (user !== undefined) {
        const email = user.email;
        if (email !== null) {
            const trackerRef = firestore.collection('notificationTrackers').doc(email);
            const newNotification: SessionNotification = {
                title: notification.title,
                subtitle: notification.subtitle,
                message: notification.message,
                createdAt : firebase.firestore.Timestamp.now()
            }
            let updatedTracker : Partial<NotificationTracker> = {
                notificationList : [newNotification, ...notifList]
            }
            trackerRef.update(updatedTracker);
        }
    }
}

export const clearNotifications = (user : FireUser) => {
  if (user !== undefined) {
    const email = user.email;
    if (email !== null) {
        const trackerRef = firestore.collection('notificationTrackers').doc(email);
        let updatedTracker : Partial<NotificationTracker> = {
            notificationList : []
        }
        trackerRef.update(updatedTracker);
    }
}
}

export const viewedTrackable = 
(user: FireUser | undefined, 
    notificationTracker: NotificationTracker | undefined, 
    viewedNotifs: boolean) => {
    if (user !== undefined) {
        const email = user.email;
        const updatedTracker: Partial<NotificationTracker> = {
            notifications: firebase.firestore.Timestamp.now(),
            productUpdates: firebase.firestore.Timestamp.now(),
        };
        if (email !== null) {
            const trackerRef = firestore.collection('notificationTrackers').doc(email);
            if (notificationTracker !== undefined && viewedNotifs ) {
                updatedTracker.productUpdates = notificationTracker.productUpdates; 
            } else if (notificationTracker !== undefined) {
                updatedTracker.notifications = notificationTracker.notifications;
            }
            trackerRef.update(updatedTracker);
        }
    }
}