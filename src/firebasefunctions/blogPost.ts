import firebase from 'firebase/app';

const firestore = firebase.firestore;

export const addBlogPost = (
    user: firebase.User | null, 
    db: firebase.firestore.Firestore, 
    title: string, description: string, 
    listItems: string[]
): boolean => {
    if (user != null) {
        const postId = db.collection('blogPosts').doc().id;
        const blogPost: Omit<BlogPost, 'postId'> = {
            title,
            description,
            listItems,
            timeEntered: firebase.firestore.Timestamp.now()
        }

        const batch = db.batch();
        batch.set(db.collection('blogPosts').doc(postId), blogPost);
        batch.commit();

        return true;
    } else return false;
}

export const editBlogPost = (user: firebase.User | null, db: firebase.firestore.Firestore, blogPost: BlogPost) => {
    if (user != null) {
      const {title, description, listItems, postId} = blogPost;
      const updatedBlogPost: Partial<BlogPost> = {
          title,
          description,
          listItems: [...listItems],
          edited: firebase.firestore.Timestamp.now(),
      }
      const postRef = db.collection('blogPosts').doc(postId);
      postRef.update(updatedBlogPost);
    }
}

export const deleteBlogPost = (
    user: firebase.User | null, 
    db: firebase.firestore.Firestore, 
    postId: BlogPost["postId"]
) => {
    if (user != null) {
        const postRef = db.collection('blogPosts').doc(postId);
        postRef.delete();
    }
}
