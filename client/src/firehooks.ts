import { useState, useEffect } from 'react';

import { firestore, loggedIn$ } from './firebase';
import { collectionData, docData } from 'rxfire/firestore';
import { switchMap } from 'rxjs/operators';

export const useDoc = <T>(collection: string, id: string | undefined, idField: string) => {
    const [doc, setDoc] = useState<T | undefined>();
    useEffect(
        // @ts-ignore Don't want to return a value
        () => {
            if (id) {
                const primaryTag$ = docData(firestore.doc(collection + '/' + id), idField);
                const subscription = primaryTag$.subscribe((d: T) => setDoc(d));
                return () => { subscription.unsubscribe(); };
            }
        },
        [id]
    );
    return doc;
};

// Primatives
// Look up a doc in Firebase by ID
export const useCourseUser = (courseUserId: string | undefined) =>
    useDoc<FireCourse>('courseUsers', courseUserId, 'courseUserId');
export const useCourse = (courseId: string | undefined) =>
    useDoc<FireCourse>('courses', courseId, 'courseId');
export const useQuestion = (questionId: string | undefined) =>
    useDoc<FireQuestion>('questions', questionId, 'questionId');
// RYAN_TODO define a FireSessionSeries type
// export const useSessionSeries = (sessionSeriesId: string | undefined) =>
//     useDoc<FireSession>('sessionSeries', sessionSeriesId, 'sessionSeriesId');
export const useSession = (sessionId: string | undefined) =>
    useDoc<FireSession>('sessions', sessionId, 'sessionId');
export const useTag = (tagId: string | undefined) =>
    useDoc<FireTag>('tags', tagId, 'tagId');
export const useUser = (userId: string | undefined) =>
    useDoc<FireUser>('users', userId, 'userId');

// Pass in a firebase query and return the results plus a function to update the query
// Storing the query in state is important because useEffect does shallow
// comparisons on the objects in the array for memoization. Without storing
// the query, we re-render and re-fetch infinitely.
export const useQuery = <T>(query: firebase.firestore.Query, idField: string):
    [T[], React.Dispatch<React.SetStateAction<firebase.firestore.Query>>] => {
    const [storedQuery, setStoredQuery] = useState(query);
    const [result, setResult] = useState<T[]>([]);
    useEffect(
        () => {
            const results$ = collectionData(query, idField);
            const subscription = results$.subscribe((results: T[]) => setResult(results));
            return () => { subscription.unsubscribe(); };
        },
        [storedQuery]
    );
    return [result, setStoredQuery];
};

// Here be dragons. The functions below this line may have unexpected
// behaviors when the values they rely on change. I'm not sure.
// Get current course user based on courseId and user
export const useMyCourseUser = (courseId: string) => {
    const [courseUser, setCourseUser] = useState<FireCourseUser | undefined>();

    useEffect(
        () => {
            const courseUsers$ = loggedIn$.pipe(
                switchMap(u => collectionData(
                    firestore
                        .collection('courseUsers')
                        .where('userId', '==', firestore.doc('users/' + u.uid))
                        .where('courseId', '==', firestore.doc('courses/' + courseId)),
                    'courseUserId'
                ))
                // RYAN_TODO better handle unexpected case w/ no courseUser
            );

            const subscription = courseUsers$.subscribe((courseUsers: FireCourseUser[]) =>
                setCourseUser(courseUsers[0]));

            return () => { subscription.unsubscribe(); };
        },
        [courseId]
    );

    return courseUser;
};

export const useMyUser = () => {
    const [user, setUser] = useState<FireUser | undefined>();

    useEffect(
        () => {
            const myUser$ = loggedIn$.pipe(
                switchMap(u => docData(firestore.doc('users/' + u.uid), 'userId'))
            );
            const subscription = myUser$.subscribe((myUser: FireUser) => setUser(myUser));
            return () => { subscription.unsubscribe(); };
        },
        []
    );

    return user;
};

export const userUpload = (user: firebase.User | null, db: firebase.firestore.Firestore) => {
    if (user != null) {
        var uid = user.uid;
        var email = user.email;
        var displayName = user.displayName;
        var photoUrl = user.photoURL;
        var metaData = user.metadata;
        var createdAt = metaData.creationTime;
        var lastActivityAt = metaData.lastSignInTime;
        var stringSplit = 0;
        var firstName = displayName;
        var lastName = '';
        if (displayName != null) {
            stringSplit = displayName.indexOf(' ');
            if (stringSplit !== -1) {
                firstName = displayName.substring(0, stringSplit);
                lastName = displayName.substring(stringSplit + 1);
            }
        }
        db.collection('users').doc(uid).set({
            email,
            firstName,
            lastName,
            photoUrl,
            createdAt,
            lastActivityAt
        })
            .then(function () {
                console.log(lastActivityAt);
            })
            .catch(function (error: string) {
                console.error('Error writing document: ', error);
            });
    }
};