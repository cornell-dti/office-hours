import { useState, useEffect } from 'react';
import * as firebase from 'firebase';
import { firestore } from './components/includes/firebase';


export const useFirestoreDoc = <T extends {}>(collection: string, id: string) => {
    const [doc, setDoc] = useState<T | undefined>(undefined);

    useEffect(
        () => {
            if (!id) {
                return undefined;
            }
            const unsub = firestore.collection(collection)
                .doc(id)
                .onSnapshot((d) => {
                    // @ts-ignore Doesn't seem to know the doc spread
                    setDoc({ id: d.id, ...d.data() });
                });

            return () => unsub();
        },
        [id],
    );

    return doc;
};

export const useDocsWithKey = <T extends {}>(collection: string, field: string, id: string): T[] => {
    const [doc, setDoc] = useState<T[]>([]);

    useEffect(
        () => {
            const unsub = firestore.collection(collection)
                .where(field, '==', id)
                .onSnapshot((q) => {
                    // @ts-ignore Doesn't seem to know the doc spread
                    setDoc(q.docs.map((d) => ({ id: d.id, ...d.data() })));
                });

            return () => unsub();
        },
        [id],
    );

    return doc;
};

export const useTag = (tagId: string) => useFirestoreDoc<FireTag>('tags', tagId);
export const useUser = (userId: string) => useFirestoreDoc<FireUser>('users', userId);
export const useCourse = (courseId: string) => useFirestoreDoc<FireCourse>('courses', courseId);
export const useSession = (sessionId: string) => useFirestoreDoc<FireSession>('sessions', sessionId);
export const useQuestion = (questionId: string) => useFirestoreDoc<FireQuestion>('questions', questionId);

export const useTagsFromIds = (tagIds: string[]) => {
    const [tags, setTags] = useState<FireTag[]>([]);
    useEffect(
        () => {
            const promises = tagIds.map(id => firestore.collection('tags').doc(id).get());
            Promise.all(promises).then(tagPromises => (
                // @ts-ignore TODO: Fix
                setTags(tagPromises.map((tag) => ({ id: tag.id, ...tag.data() })))
            ));
        },
        // React does a shallow compare on arrays (reference, not value)
        // .join lets us not re-render every time because it's string equality
        [tagIds.join(' ')],
    );

    return tags;
};

export const useSessionQuestions = (sessionId: string) => {
    const [questions, setQuestions] = useState<FireQuestion[]>([]);

    useEffect(
        () => {
            const unsub = firestore
                .collection('questions')
                .where('sessionId', '==', sessionId)
                .onSnapshot((q) => {
                    // @ts-ignore Doesn't seem to know the doc spread
                    setQuestions(q.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
                });

            return () => unsub();
        },
        [sessionId],
    );

    return questions;
};

export const useAuth = () => {
    const [auth, setAuth] = useState(
        () => {
            const user = firebase.auth().currentUser;
            return [user == null, user];
        },
    );

    useEffect(
        () => {
            const unsub = firebase.auth().onAuthStateChanged((user) => {
                setAuth([false, user]);
            });

            return () => unsub();
        },
        [],
    );

    return auth;
};
