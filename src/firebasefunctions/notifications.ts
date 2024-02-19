import firebase from 'firebase/app';
import { firestore } from '../firebase';

export const createNotificationTracker = async (user: firebase.User | null) => {
    if (user !== null) {
        const email = user.email;
        if (email !== null) {
            const trackerRef = firestore.collection('notificationTrackers').doc(email);
            const newTracker: NotificationTracker = {
                id: email,
                notifications: firebase.firestore.Timestamp.now(),
                productUpdates: firebase.firestore.Timestamp.now(),
            }
            trackerRef.set(newTracker)
        }
    }
}

export const addDBNotification = (user: FireUser, title: string, subtitle: string, message: string) => {
    if (user !== undefined) {
        const email = user.email;
        if (email !== null) {
            const notifId = firestore.collection('notificationTrackers').doc(email)
                .collection('notifications').doc().id;
            const createdAt = firebase.firestore.Timestamp.now();
            const wasSent = false;
            const newNotif: FireNotification = {
                notifId,
                title,
                subtitle,
                message,
                createdAt,
                wasSent,
            };
            const batch = firestore.batch();
            batch.set(firestore.collection('notificationTrackers').doc(email)
                .collection('notifications').doc(notifId), newNotif);
            batch.commit();
        }
    }
}

// Clears any notifications older than 24 hours, with the intended side effects 
// of initializing any uninitialized notificationTracker/list
export const periodicClearNotifications = (user: FireUser | undefined, 
    notificationTracker: NotificationTracker | undefined) => {
    if (user !== undefined) {
        const email = user.email;
        if (email !== null) {
            const trackerRef = firestore.collection('notificationTrackers').doc(email);
            if (notificationTracker !== undefined) {
                const day = 1000 * 60 * 60 * 24;
                const dayPast = Date.now() - day;
                firestore.collection("notificationTrackers").doc(email)
                    .collection('notifications').get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            if (doc.data().createdAt.toDate().getTime() <= dayPast) {
                                const batch = firestore.batch();
                                const delNotifRef = firestore.collection("notificationTrackers")
                                    .doc(email).collection('notifications').doc(doc.id);
                                batch.delete(delNotifRef);
                                batch.commit();
                            }
                        });
                    });
            } else {
                // If a user does not have an initialized notificationTracker, initialize it
                const updatedTracker: Partial<NotificationTracker> = {
                    notificationList: [],
                    id: email,
                    notifications: firebase.firestore.Timestamp.now(),
                    productUpdates: firebase.firestore.Timestamp.now(),
                };
                trackerRef.set(updatedTracker);
            }
        }
    }
}

// Clears the entire set of notifications
export const clearNotifications = async (user: firebase.User | null) => {
    if (user !== null) {
        const email = user.email;
        if (email != null) {
            const trackerRef = firestore.collection('notificationTrackers').doc(email);
            const tracker = await trackerRef.get();
            if (!tracker.exists) {
                const updatedTracker: Partial<NotificationTracker> = {
                    id: email,
                    notifications: firebase.firestore.Timestamp.now(),
                    productUpdates: firebase.firestore.Timestamp.now(),
                }
                trackerRef.set(updatedTracker);
            } else {
                firestore.collection("notificationTrackers").doc(email)
                    .collection('notifications').get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            const batch = firestore.batch();
                            const delNotifRef = firestore.collection("notificationTrackers")
                                .doc(email).collection('notifications').doc(doc.id);
                            batch.delete(delNotifRef);
                            batch.commit();
                        
                        });
                    });
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
                        trackerRef.set(updatedTracker);
                    }
                })
            }
        }
    }

// export const updateLastSent =
//     async (user: FireUser | undefined, notificationTracker: NotificationTracker | undefined) => {
//         if (user !== undefined) {
//             const email = user.email;
//             const updatedTracker: Partial<NotificationTracker> = {
//                 lastSent: firebase.firestore.Timestamp.now(),
//             }
//             if (email !== null) {
//                 const trackerRef = firestore.collection('notificationTrackers').doc(email);
//                 trackerRef.get().then(doc => {
//                     if (notificationTracker !== undefined && doc.exists) {
//                         trackerRef.update(updatedTracker);
//                     } else {
//                         updatedTracker.id = email;
//                         updatedTracker.notificationList = [];
//                         updatedTracker.notifications = firebase.firestore.Timestamp.now();
//                         updatedTracker.productUpdates = firebase.firestore.Timestamp.now();
//                         updatedTracker.lastSent = firebase.firestore.Timestamp.now();
//                         trackerRef.set(updatedTracker);
//                     }
//                 })
//             }
//         };
//     }