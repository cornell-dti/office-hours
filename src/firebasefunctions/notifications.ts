import { Timestamp, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

/**
 * Converts a Firebase Timestamp to milliseconds.
 * 
 * @param {Timestamp} fireTimestamp The Firebase Timestamp to convert.
 * @returns {number} The number of milliseconds since the Unix epoch.
 */
function timestampToMillis(fireTimestamp: FireTimestamp) {
    return fireTimestamp.toDate().getTime();
}

export const createNotificationTracker = async (user: FireUser | null) => {
    if (user !== null) {
        const email = user.email;
        if (email !== null) {
            const trackerRef = doc(firestore, 'notificationTrackers', email);
            const newTracker = {
                id: email,
                notificationList: [],
                notifications: Timestamp.now(),
                productUpdates: Timestamp.now(),
                lastSent: Timestamp.now(),
            };
            await setDoc(trackerRef, newTracker);
        }
    }
};

export const addDBNotification = 
    async (user: FireUser, notification: Omit<SessionNotification, 'notificationId' | 'createdAt'>) => {
        if (user && user.email) {
            const trackerRef = doc(firestore, 'notificationTrackers', user.email);
            const docSnap = await getDoc(trackerRef);
            const prevTracker = docSnap.data();
            const notifList = prevTracker?.notificationList ?? [];
            const newNotification = {
                title: notification.title,
                subtitle: notification.subtitle,
                message: notification.message,
                createdAt: Timestamp.now(),
            };
        
            if (docSnap.exists()) {
                const updatedTracker = {
                    notificationList: [newNotification, ...notifList]
                };
                await updateDoc(trackerRef, updatedTracker);
            } else {
                const newTracker = {
                    id: user.email,
                    notificationList: [newNotification],
                    notifications: Timestamp.now(),
                    productUpdates: Timestamp.now(),
                    lastSent: Timestamp.now(),
                };
                await setDoc(trackerRef, newTracker);
            }
        }
    };

// Clears any notifications older than 24 hours, with the intended side effects 
// of initializing any uninitialized notificationTracker/list
export const periodicClearNotifications = async (user: FireUser, notificationTracker: NotificationTracker) => {
    if (user && user.email) {
        const trackerRef = doc(firestore, 'notificationTrackers', user.email);
        if (notificationTracker && notificationTracker.notificationList) {
            const day = 1000 * 60 * 60 * 24;
            const dayPast = Date.now() - day;
            const updatedTracker = {
                notificationList: notificationTracker.notificationList.filter(notification => 
                    timestampToMillis(notification.createdAt) > dayPast)
            };
            await updateDoc(trackerRef, updatedTracker);
        } else {
            const initialTrackerData = {
                notificationList: [],
                ...(notificationTracker ? {} : {
                    id: user.email,
                    notifications: Timestamp.now(),
                    productUpdates: Timestamp.now(),
                    lastSent: Timestamp.now(),
                })
            };
            if (notificationTracker) {
                await updateDoc(trackerRef, initialTrackerData);
            } else {
                await setDoc(trackerRef, initialTrackerData);
            }
        }
    }
};

// Clears the entire set of notifications
export const clearNotifications = async (user: FireUser) => {
    if (user !== null) {
        const email = user.email;
        if (email) {
            const trackerRef = doc(firestore, 'notificationTrackers', email);
            const tracker = await getDoc(trackerRef);
            const updatedTracker : Partial<NotificationTracker> = {
                notificationList: []
            };
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
};

export const viewedTrackable = 
    async (user: FireUser, notificationTracker: NotificationTracker, viewedNotifs: boolean) => {
        if (user && user.email) {
            const email = user.email;
            const trackerRef = doc(firestore, 'notificationTrackers', email);
            const docSnap = await getDoc(trackerRef);
        
            const updatedTracker: Partial<NotificationTracker>  = {
                notifications: Timestamp.now(),  // This updates the notifications timestamp to now
                productUpdates: Timestamp.now(),  // This updates the product updates timestamp to now
            };

            if (docSnap.exists()) {
                if (notificationTracker) {
                    if (viewedNotifs) {
                        updatedTracker.productUpdates = notificationTracker.productUpdates;  
                        // Preserves the current product updates timestamp if viewing notifications
                    } else {
                        updatedTracker.notifications = notificationTracker.notifications;  
                        // Preserves the current notifications timestamp if viewing product updates
                    }
                }
                await updateDoc(trackerRef, updatedTracker);
            } else {
                updatedTracker.id = email;
                updatedTracker.notificationList = [];
                updatedTracker.lastSent = Timestamp.now();
                await setDoc(trackerRef, updatedTracker);  // Initializes a new tracker if it doesn't exist
            }
        }
    };

export const updateLastSent = async (user: FireUser | undefined, notificationTracker: NotificationTracker) => {
    if (user && user.email) {
        const trackerRef = doc(firestore, 'notificationTrackers', user.email);
        const docSnap = await getDoc(trackerRef);
    
        if (docSnap.exists() && notificationTracker) {
            await updateDoc(trackerRef, { lastSent: Timestamp.now() });
        } else {
            const newTracker = {
                id: user.email,
                notificationList: [],
                notifications: Timestamp.now(),
                productUpdates: Timestamp.now(),
                lastSent: Timestamp.now()
            };
            await setDoc(trackerRef, newTracker);
        }
    }
};
    