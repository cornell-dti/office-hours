import { firestore } from '../firebase';
import { doc, collection, deleteDoc, updateDoc, writeBatch, Timestamp} from 'firebase/firestore';
import { User } from 'firebase/auth';

export const addBlogPost = (
    user: User | null, 
    title: string, description: string, 
    listItems: string[]
): boolean => {
    if (user != null) {
        const postRef = doc(collection(firestore, "blogPosts"));
        const blogPost: Omit<BlogPost, 'postId'> = {
            title,
            description,
            listItems,
            timeEntered: Timestamp.now()
        }

        const batch = writeBatch(firestore);
        batch.set(postRef, blogPost);
        batch.commit();

        return true;
    } return false;
}

export const editBlogPost = (user: User | null, blogPost: BlogPost) => {
    if (user != null) {
        const {title, description, listItems, postId} = blogPost;
        const updatedBlogPost: Partial<BlogPost> = {
            title,
            description,
            listItems: [...listItems],
            edited: Timestamp.now(),
        }
        const postRef = doc(firestore, 'blogPosts', postId);
        updateDoc(postRef, updatedBlogPost);
    }
}

export const deleteBlogPost = (
    user: User | null, 
    postId: BlogPost['postId']
) => {
    if (user != null) {
        const postRef = doc(firestore, 'blogPosts', postId);
        deleteDoc(postRef);
    }
}
