import firebase from "firebase/compat/app";
import {User} from "firebase/auth"

const firestore = firebase.firestore();
const Timestamp = firebase.firestore.Timestamp;

export const createNotificationTracker = async (user: User | null) => {
    if (user !== null) {
        const email = user.email;
        if (email !== null) {
            const trackerRef = firestore.collection('notificationTrackers').doc(email);
            const newTracker: NotificationTracker = {
                id: email,
                notificationList: [],
                notifications: Timestamp.now(),
                productUpdates: Timestamp.now(),
                lastSent: Timestamp.now(),
            }

            try {
                await trackerRef.set(newTracker)
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
                const trackerRef = firestore.collection('notificationTrackers').doc(email);
                const prevTrackerSnap = (await trackerRef.get()).data();

                if (prevTrackerSnap?.exists) {
                    const prevTracker = prevTrackerSnap.data();
                    const notifList: SessionNotification[] =
                        prevTracker !== undefined &&
                            prevTracker.notificationList !== undefined ? prevTracker.notificationList : []
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

                        trackerRef.update(updatedTracker);
                    } else {
                        const newTracker: NotificationTracker = {
                            id: email,
                            notificationList: [newNotification],
                            notifications: Timestamp.now(),
                            productUpdates: Timestamp.now(),
                            lastSent: Timestamp.now(),
                        }
                        trackerRef.set(newTracker);
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
            const trackerRef = firestore.collection('notificationTrackers').doc(email);
            if (notificationTracker !== undefined &&
                    notificationTracker.notificationList !== undefined) {
                const day = 1000 * 60 * 60 * 24;
                const dayPast = Date.now() - day;
                const updatedTracker: Partial<NotificationTracker> = {
                    notificationList: notificationTracker?.notificationList?.filter(notification => {
                        return notification.createdAt.toDate().getTime() > dayPast;
                    })
                }
                trackerRef.update(updatedTracker);
            } else if (
            // If a user does not have an initialized notificationList, initialize it
                notificationTracker !== undefined &&
                    notificationTracker.notificationList === undefined
            ) {
                const updatedTracker: Partial<NotificationTracker> = {
                    notificationList: []
                }
                trackerRef.update(updatedTracker);
            } else {
                // If a user does not have an initialized notificationTracker, initialize it
                const updatedTracker: Partial<NotificationTracker> = {
                    notificationList: [],
                    id: email,
                    notifications: Timestamp.now(),
                    productUpdates: Timestamp.now(),
                    lastSent: Timestamp.now()
                };
                trackerRef.set(updatedTracker);
            }
        }
    }

}

// Clears the entire set of notifications
export const clearNotifications = async (user: User | null) => {
    if (user !== null) {
        const email = user.email;
        if (email != null) {
            const trackerRef = firestore.collection('notificationTrackers').doc(email);
            const tracker = await trackerRef.get();
            const updatedTracker: Partial<NotificationTracker> = {
                notificationList: []
            }
            if (!tracker.exists) {
                updatedTracker.id = email;
                updatedTracker.notifications = Timestamp.now();
                updatedTracker.productUpdates = Timestamp.now();
                updatedTracker.lastSent = Timestamp.now();
                trackerRef.set(updatedTracker);
            } else {
                trackerRef.update(updatedTracker);
            }
        }
    }
}

export const viewedTrackable =
    async (user: FireUser | undefined,
        notificationTracker: NotificationTracker | undefined,
        viewedNotifs: boolean) => {
        if (user !== undefined) {
            const email = user.email;
            const updatedTracker: Partial<NotificationTracker> = {
                notifications: Timestamp.now(),
                productUpdates: Timestamp.now(),
            };
            if (email !== null) {
                const trackerRef = firestore.collection('notificationTrackers').doc(email);
                const trackerSnap = await trackerRef.get();
                if (trackerSnap.exists && notificationTracker !== undefined) {
                    if (viewedNotifs) {
                        updatedTracker.productUpdates = notificationTracker.productUpdates;
                    } else {
                        updatedTracker.notifications = notificationTracker.notifications;
                    }
                    trackerRef.update(updatedTracker);
                } else {
                    updatedTracker.id = email;
                    updatedTracker.notificationList = [];
                    updatedTracker.lastSent = Timestamp.now();
                    trackerRef.set(updatedTracker);
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
                const trackerRef = firestore.collection('notificationTrackers').doc(email);
                trackerRef.get().then(doc => {
                    if (notificationTracker !== undefined && doc.exists) {
                        trackerRef.update(updatedTracker);
                    } else {
                        updatedTracker.id = email;
                        updatedTracker.notificationList = [];
                        updatedTracker.notifications = Timestamp.now();
                        updatedTracker.productUpdates = Timestamp.now();
                        updatedTracker.lastSent = Timestamp.now();
                        trackerRef.set(updatedTracker);
                    }
                })
            }
        }
    }