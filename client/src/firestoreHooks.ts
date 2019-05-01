import { useState, useEffect } from 'react';
import { firestore } from './components/includes/firebase';

import * as firebase from 'firebase';

export let useFirestoreDoc = <T extends {}>(collection: string, id: string) => {
    let [doc, setDoc] = useState<T | undefined>(undefined);

    if (!id) {
        return undefined;
    }

    useEffect(
        () => {
            const unsub = firestore.collection(collection)
                .doc(id)
                .onSnapshot((d) => {
                    // @ts-ignore Doesn't seem to know the doc spread
                    setDoc({ 'id': d.id, ...d.data() });
                });

            return () => unsub();
        },
        [id]
    );

    return doc;
};

export let useDocsWithKey = <T extends {}>(collection: string, field: string, id: string): T[] => {
    let [doc, setDoc] = useState<Array<T>>([]);

    useEffect(
        () => {
            const unsub = firestore.collection(collection)
                .where(field, '==', id)
                .onSnapshot((q) => {
                    // @ts-ignore Doesn't seem to know the doc spread
                    setDoc(q.docs.map((d) => {
                        return { 'id': d.id, ...d.data() };
                    }));
                });

            return () => unsub();
        },
        [id]
    );

    return doc;
};

export let useTag = (tagId: string) => useFirestoreDoc<FireTag>('tags', tagId);
export let useUser = (userId: string) => useFirestoreDoc<FireUser>('users', userId);
export let useCourse = (courseId: string) => useFirestoreDoc<FireCourse>('courses', courseId);
export let useSession = (sessionId: string) => useFirestoreDoc<FireSession>('sessions', sessionId);
export let useQuestion = (questionId: string) => useFirestoreDoc<FireQuestion>('questions', questionId);

export let useQuestionTags = (questionId: string) =>
    useDocsWithKey<FireQuestionTag>('questionTags', 'questionId', questionId);

export let useTagsFromIds = (tagIds: string[]) => {
    let [tags, setTags] = useState<Array<FireTag>>([]);
    useEffect(
        () => {
            const promises = tagIds.map(id => firestore.collection('tags').doc(id).get());
            Promise.all(promises).then(tagPromises =>
                // @ts-ignore
                setTags(tagPromises.map(tag => { return { id: tag.id, ...tag.data() }; }))
            );
        },
        // React does a shallow compare on arrays (reference, not value)
        // .join lets us not re-render every time because it's string equality
        [tagIds.join(' ')]
    );

    return tags;
};

export let useSessionQuestions = (sessionId: string) => {
    let [questions, setQuestions] = useState<FireQuestion[]>([]);

    useEffect(
        () => {
            const unsub = firestore
                .collection('questions')
                .where('sessionId', '==', sessionId)
                .onSnapshot((q) => {
                    // @ts-ignore Doesn't seem to know the doc spread
                    setQuestions(q.docs.map((doc) => {
                        return { 'id': doc.id, ...doc.data() };
                    }));
                    console.log(q);
                });

            return () => unsub();
        },
        [sessionId]
    );

    return questions;
};

export let useAuth = () => {
    const [auth, setAuth] = useState(
        () => {
            const user = firebase.auth().currentUser;
            return {
                initializing: user == null,
                user
            };
        }
    );

    useEffect(
        () => {
            const unsub = firebase.auth().onAuthStateChanged((user) => {
                console.log(JSON.stringify(user));
                setAuth({ initializing: false, user });
            });

            return () => unsub();
        },
        []
    );

    return auth;
};
