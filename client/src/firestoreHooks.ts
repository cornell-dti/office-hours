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

export let useUser = (userId: string) => useFirestoreDoc<FireUser>('users', userId);
export let useCourse = (courseId: string) => useFirestoreDoc<FireCourse>('courses', courseId);
export let useSession = (sessionId: string) => useFirestoreDoc<FireSession>('sessions', sessionId);

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
