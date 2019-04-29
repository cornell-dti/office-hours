import { useState, useEffect } from 'react';
import { firestore } from './components/includes/firebase';

export let useFirestoreDoc = <T extends {}>(collection: string, id: string) => {
    let [doc, setDoc] = useState<T | undefined>(undefined);

    useEffect(
        () => {
            const unsub = firestore.collection(collection)
                .doc(id)
                .onSnapshot((d) => {
                    if (d) {
                        // @ts-ignore Doesn't seem to know the doc spread
                        setDoc({ 'id': d.id, ...d.data() });
                    }
                });

            return () => unsub();
        },
        [id]
    );

    return doc;
};

export let useUser = (userId: string) => useFirestoreDoc<FireUser>('users', userId);
export let useCourse = (courseId: string) => useFirestoreDoc<FireCourse>('courses', courseId);
export let useSession = (sessionId: string) => useFirestoreDoc<FireSession>('sessions', sessionId);
