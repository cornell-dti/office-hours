import { useState } from 'react';
import { firestore } from './components/includes/firebase';

export let useFirestoreDoc = <T extends {}>(collection: string, id: string) => {
    let [doc, setDoc] = useState<T | undefined>(undefined);
    firestore
        .collection(collection)
        .doc(id)
        .onSnapshot((d) => {
            // @ts-ignore Doesn't seem to know the doc spread
            setDoc({ 'id': d.id, ...d.data() });
        });
    return doc;
};

export let useUser = (userId: string) => useFirestoreDoc<FireUser>('users', userId);
export let useCourse = (courseId: string) => useFirestoreDoc<FireCourse>('courses', courseId);
