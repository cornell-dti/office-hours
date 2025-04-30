import { doc, getDoc, setDoc, updateDoc, Timestamp} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { firestore } from '../firebase';

export const createNotificationTracker = async (user: User | null) => {
    if (user !== null) {
        const email = user.email;
        if (email !== null) {
            const trackerRef = doc(firestore, 'notificationTrackers', email);
            const newTracker: NotificationTracker = {
                id: email,
                notificationList: [],
                notifications: Timestamp.now(),
                productUpdates: Timestamp.now(),
                lastSent: Timestamp.now(),
            }

            try {
                await setDoc(trackerRef, newTracker);
                // eslint-disable-next-line no-console
                console.log("Notification tracker created successfully!");
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error("Error creating notification tracker:", error);
            }
        }
    }
}

export const addDBNotification =
    async (user: FireUser, notification: Omit<SessionNotification, 'notificationId' | 'createdAt'>) => {
        if (user !== undefined) {
            const email = user.email;
            if (email !== null) {
                const trackerRef = doc(firestore, 'notificationTrackers', email);
                const prevTrackerSnap = (await getDoc(trackerRef));

                if (prevTrackerSnap.exists()) {
                    const prevTracker = prevTrackerSnap.data();
                    const notifList: SessionNotification[] =
                        prevTracker !== undefined &&
                            prevTracker.notificatoniList !== undefined ? prevTracker.notificationList : []
                    const newNotification: SessionNotification = {
                        title: notification.title,
                        subtitle: notification.subtitle,
                        message: notification.message,
                        createdAt: Timestamp.now()
                    }
                    if (prevTracker !== undefined) {
                        const updatedTracker: Partial<NotificationTracker> = {
                            notificationList: [newNotification, ...notifList]
                        }

                        await updateDoc(trackerRef, updatedTracker);
                    } else {
                        const newTracker: NotificationTracker = {
                            id: email,
                            notificationList: [newNotification],
                            notifications: Timestamp.now(),
                            productUpdates: Timestamp.now(),
                            lastSent: Timestamp.now(),
                        }
                        await setDoc(trackerRef, newTracker);
                    }
                } else {
                    // eslint-disable-next-line no-console
                    console.log("No previous tracker found.");
                }
            }
        }
    }

// Clears any notifications older than 24 hours, with the intended side effects 
// of initializing any uninitialized notificationTracker/list

export const periodicClearNotifications = 
async (user: FireUser | undefined, notificationTracker: NotificationTracker | undefined) => {
    if (user !== undefined) {
        const email = user.email;
        if (email !== null) {
            const trackerRef = doc(firestore, "notificationTrackers", email);
            if (notificationTracker !== undefined &&
                    notificationTracker.notificationList !== undefined) {
                const day = 1000 * 60 * 60 * 24;
                const dayPast = Date.now() - day;
                const updatedTracker: Partial<NotificationTracker> = {
                    notificationList: notificationTracker?.notificationList?.filter(notification => {
                        return notification.createdAt.toDate().getTime() > dayPast;
                    })
                }
                await updateDoc(trackerRef,updatedTracker);
            } else if (
            // If a user does not have an initialized notificationList, initialize it
                notificationTracker !== undefined &&
                    notificationTracker.notificationList === undefined
            ) {
                const updatedTracker: Partial<NotificationTracker> = {
                    notificationList: []
                }
                await updateDoc(trackerRef, updatedTracker);
            } else {
                // If a user does not have an initialized notificationTracker, initialize it
                const updatedTracker: Partial<NotificationTracker> = {
                    notificationList: [],
                    id: email,
                    notifications: Timestamp.now(),
                    productUpdates: Timestamp.now(),
                    lastSent: Timestamp.now()
                };
                await setDoc(trackerRef, updatedTracker);
            }
        }
    }

}

// Clears the entire set of notifications
export const clearNotifications = async (user: User | null) => {
    if (user !== null) {
        const email = user.email;
        if (email != null) {
            const trackerRef = doc(firestore, 'notificationTrackers', email);
            const tracker = await getDoc(trackerRef);
            const updatedTracker: Partial<NotificationTracker> = {
                notificationList: []
            }
            if (!tracker.exists()) {
                updatedTracker.id = email;
                updatedTracker.notifications = Timestamp.now();
                updatedTracker.productUpdates = Timestamp.now();
                updatedTracker.lastSent = Timestamp.now();
                await setDoc(trackerRef, updatedTracker);
            } else {
                await updateDoc(trackerRef, updatedTracker);
            }
        }
    }
}

export const viewedTrackable =
    async (user: FireUser | undefined,
        notificationTracker: NotificationTracker | undefined,
        viewedNotifs: boolean) => {
        console.log('calling notif');
        if (user !== undefined) {
            const email = user.email;
            const updatedTracker: Partial<NotificationTracker> = {
                notifications: Timestamp.now(),
                productUpdates: Timestamp.now(),
            };
            if (email !== null) {
                const trackerRef = doc(firestore, 'notificationTrackers', email);
                const trackerSnap = await getDoc(trackerRef);
                if (trackerSnap.exists() && notificationTracker !== undefined) {
                    if (viewedNotifs) {
                        updatedTracker.productUpdates = notificationTracker.productUpdates;
                    } else {
                        updatedTracker.notifications = notificationTracker.notifications;
                    }
                    await updateDoc(trackerRef, updatedTracker);
                } else {
                    updatedTracker.id = email;
                    updatedTracker.notificationList = [];
                    updatedTracker.lastSent = Timestamp.now();
                    await setDoc(trackerRef, updatedTracker);
                }
            }
        }
    }

export const updateLastSent =
    async (user: FireUser | undefined, notificationTracker: NotificationTracker | undefined) => {
        if (user !== undefined) {
            const email = user.email;
            const updatedTracker: Partial<NotificationTracker> = {
                lastSent: Timestamp.now(),
            }
            if (email !== null) {
                const trackerRef = doc(firestore, 'notificationTrackers', email);
                const trackerSnap = await getDoc(trackerRef);
                if( trackerSnap.exists() && notificationTracker !== undefined ){
                    await updateDoc(trackerRef, updatedTracker);
                } else {
                    updatedTracker.id = email;
                    updatedTracker.notificationList = [];
                    updatedTracker.notifications = Timestamp.now();
                    updatedTracker.productUpdates = Timestamp.now();
                    updatedTracker.lastSent = Timestamp.now();
                    await setDoc(trackerRef, updatedTracker);
                }
            }
        }
    }