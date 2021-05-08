import firebase from 'firebase/app';
import { firestore } from '../firebase';

export const addBlogPost = (
    user: firebase.User | null, 
    title: string, description: string, 
    listItems: string[]
): boolean => {
    if (user != null) {
        const postId = firestore.collection('blogPosts').doc().id;
        const blogPost: Omit<BlogPost, 'postId'> = {
            title,
            description,
            listItems,
            timeEntered: firebase.firestore.Timestamp.now()
        }

        const batch = firestore.batch();
        batch.set(firestore.collection('blogPosts').doc(postId), blogPost);
        batch.commit();

        return true;
    } return false;
}

export const editBlogPost = (user: firebase.User | null, blogPost: BlogPost) => {
    if (user != null) {
        const {title, description, listItems, postId} = blogPost;
        const updatedBlogPost: Partial<BlogPost> = {
            title,
            description,
            listItems: [...listItems],
            edited: firebase.firestore.Timestamp.now(),
        }
        const postRef = firestore.collection('blogPosts').doc(postId);
        postRef.update(updatedBlogPost);
    }
}

export const deleteBlogPost = (
    user: firebase.User | null, 
    postId: BlogPost['postId']
) => {
    if (user != null) {
        const postRef = firestore.collection('blogPosts').doc(postId);
        postRef.delete();
    }
}

export const viewedTrackable = 
(user: FireUser | undefined, 
    notificationTracker: NotificationTracker | undefined, 
    viewedNotifs: boolean) => {
    if (user !== undefined) {
        const email = user.email;
        const updatedTracker: NotificationTracker = {
            notifications: firebase.firestore.Timestamp.now(),
            productUpdates: firebase.firestore.Timestamp.now()
        }
        if (email !== null) {
            const trackerRef = firestore.collection('notificationTrackers').doc(email);
            if (notificationTracker !== undefined && viewedNotifs) {
                updatedTracker.productUpdates = notificationTracker.productUpdates
            } else if (notificationTracker !== undefined) {
                updatedTracker.notifications = notificationTracker.notifications
            }
            trackerRef.update(updatedTracker)
        }
    }
}
