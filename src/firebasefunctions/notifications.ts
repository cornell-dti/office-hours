import firebase from 'firebase/app';
import { firestore } from '../firebase';

export const createNotificationTracker = async (user: firebase.User | null) => {
    if (user !== null) {
        const uid = user.uid;
        const email = user.email;
        if (email !== null) {
            const trackerRef = firestore.collection('notificationTrackers').doc(email);
            const newTracker: NotificationTracker = {
                id: email,
                notificationList: [],
                notifications: firebase.firestore.Timestamp.now(),
                productUpdates: firebase.firestore.Timestamp.now(),
                lastSent: firebase.firestore.Timestamp.now(),
            }
            trackerRef.set(newTracker)
        }
    }
}

export const addDBNotification =
    async (user: FireUser, notification: Omit<SessionNotification, 'notificationId' | 'createdAt'>) => {
        if (user !== undefined) {
            const email = user.email;
            if (email !== null) {
                const trackerRef = firestore.collection('notificationTrackers').doc(email);
                const prevTracker = (await trackerRef.get()).data();
                const notifList: SessionNotification[] =
                    prevTracker !== undefined &&
                        prevTracker.notificatoniList !== undefined ? prevTracker.notificationList : []
                const newNotification: SessionNotification = {
                    title: notification.title,
                    subtitle: notification.subtitle,
                    message: notification.message,
                    createdAt: firebase.firestore.Timestamp.now()
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
                        notifications: firebase.firestore.Timestamp.now(),
                        productUpdates: firebase.firestore.Timestamp.now(),
                        lastSent: firebase.firestore.Timestamp.now(),
                    }
                    trackerRef.set(newTracker)
                }
            }
        }
    }

export const periodicClearNotifications =
    (user: FireUser | undefined, notificationTracker: NotificationTracker | undefined) => {
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
                    notificationTracker !== undefined &&
                    notificationTracker.notificationList === undefined
                ) {
                    const trackerRef = firestore.collection('notificationTrackers').doc(email);
                    const updatedTracker: Partial<NotificationTracker> = {
                        notificationList: []
                    }
                    trackerRef.update(updatedTracker);
                } else {
                    const updatedTracker: Partial<NotificationTracker> = {
                        notificationList: [],
                        id: email,
                        notifications: firebase.firestore.Timestamp.now(),
                        productUpdates: firebase.firestore.Timestamp.now(),
                        lastSent: firebase.firestore.Timestamp.now()
                    };
                    trackerRef.set(updatedTracker);
                }
            }
        }

    }

export const clearNotifications = async (user: firebase.User | null) => {
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
                updatedTracker.notifications = firebase.firestore.Timestamp.now();
                updatedTracker.productUpdates = firebase.firestore.Timestamp.now();
                updatedTracker.lastSent = firebase.firestore.Timestamp.now();
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
                notifications: firebase.firestore.Timestamp.now(),
                productUpdates: firebase.firestore.Timestamp.now(),
            };
            if (email !== null) {
                const trackerRef = firestore.collection('notificationTrackers').doc(email);
                trackerRef.get().then(doc => {
                    if (notificationTracker !== undefined && doc.exists) {
                        if (viewedNotifs) {
                            updatedTracker.productUpdates = notificationTracker.productUpdates;
                        } else {
                            updatedTracker.notifications = notificationTracker.notifications;
                        }
                        trackerRef.update(updatedTracker);
                    } else {
                        updatedTracker.id = email;
                        updatedTracker.notificationList = [];
                        updatedTracker.lastSent = firebase.firestore.Timestamp.now();
                        trackerRef.set(updatedTracker);
                    }
                })
            }
        }
    }

export const updateLastSent =
    async (user: FireUser | undefined, notificationTracker: NotificationTracker | undefined) => {
        if (user !== undefined) {
            const email = user.email;
            const updatedTracker: Partial<NotificationTracker> = {
                lastSent: firebase.firestore.Timestamp.now(),
            }
            if (email !== null) {
                const trackerRef = firestore.collection('notificationTrackers').doc(email);
                trackerRef.get().then(doc => {
                    if (notificationTracker !== undefined && doc.exists) {
                        trackerRef.update(updatedTracker);
                    } else {
                        updatedTracker.id = email;
                        updatedTracker.notificationList = [];
                        updatedTracker.notifications = firebase.firestore.Timestamp.now();
                        updatedTracker.productUpdates = firebase.firestore.Timestamp.now();
                        updatedTracker.lastSent = firebase.firestore.Timestamp.now();
                        trackerRef.set(updatedTracker);
                    }
                })
            }
        };
    }