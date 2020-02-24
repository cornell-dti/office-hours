import { useState, useEffect } from 'react';

import { firestore, loggedIn$ } from './firebase';
import { collectionData, docData } from 'rxfire/firestore';
import { switchMap } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { SingletonObservable, createUseSingletonObservableHook } from './utilities/singleton-observable-hook';

export const useDoc = <T>(collection: string, id: string | undefined, idField: string) => {
    const [doc, setDoc] = useState<T | undefined>();
    useEffect(
        () => {
            if (id) {
                const primaryTag$: Observable<T> = docData(firestore.doc(collection + '/' + id), idField);
                const subscription = primaryTag$.subscribe((d: T) => setDoc(d));
                return () => { subscription.unsubscribe(); };
            }
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            return () => { };
        },
        [collection, id, idField]
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
export const useSessionSeries = (sessionSeriesId: string | undefined) =>
    useDoc<FireSessionSeries>('sessionSeries', sessionSeriesId, 'sessionSeriesId');
export const useSession = (sessionId: string | undefined) =>
    useDoc<FireSession>('sessions', sessionId, 'sessionId');
export const useTag = (tagId: string | undefined) =>
    useDoc<FireTag>('tags', tagId, 'tagId');
export const useUser = (userId: string | undefined) =>
    useDoc<FireUser>('users', userId, 'userId');

// Pass in a query parameter and a firebase query generator and return the results.
// The indirection through query parameter is important because useEffect does shallow
// comparisons on the objects in the array for memoization. Without storing
// the query, we re-render and re-fetch infinitely.
export const useQuery = <T, P=string>(
    queryParameter: P, getQuery: (parameter: P) => firebase.firestore.Query, idField: string
): T[] => {
    const [result, setResult] = useState<T[]>([]);
    useEffect(
        () => {
            const results$: Observable<T[]> = collectionData(getQuery(queryParameter), idField);
            const subscription = results$.subscribe(results => setResult(results));
            return () => { subscription.unsubscribe(); };
        },
        [queryParameter, getQuery, idField]
    );
    return result;
};

// Here be dragons. The functions below this line may have unexpected
// behaviors when the values they rely on change. I'm not sure.
// Get current course user based on courseId and user
export const useMyCourseUser = (courseId: string) => {
    const [courseUser, setCourseUser] = useState<FireCourseUser | undefined>();

    useEffect(
        () => {
            const courseUsers$ = loggedIn$.pipe(
                switchMap(u => {
                    const query = firestore
                        .collection('courseUsers')
                        .where('userId', '==', u.uid)
                        .where('courseId', '==', courseId);
                    return collectionData<FireCourseUser>(query, 'courseUserId');
                })
                // RYAN_TODO better handle unexpected case w/ no courseUser
            );

            const subscription = courseUsers$.subscribe(courseUsers =>
                setCourseUser(courseUsers[0]));

            return () => subscription.unsubscribe();
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
                switchMap(u =>
                    docData(firestore.doc('users/' + u.uid), 'userId') as Observable<FireUser>
                )
            );
            const subscription = myUser$.subscribe(myUser => setUser(myUser));
            return () => { subscription.unsubscribe(); };
        },
        []
    );

    return user;
};

const fireCoursesObservable: Observable<FireCourse[]> = (() => {
    const courseUsers$ = loggedIn$.pipe(
        switchMap(user =>
            collectionData(
                firestore.collection('courseUsers').where('userId', '==', user.uid),
                'courseUserId'
            ) as Observable<FireCourseUser[]>
        )
    );
    return courseUsers$.pipe(
        switchMap((courseUsers: FireCourseUser[]) =>
            combineLatest(...courseUsers.map(courseUser =>
                docData(firestore.doc(`courses/${courseUser.courseId}`), 'courseId'))
            )
        )
    );
})();
export const fireCoursesSingletonObservable = new SingletonObservable([], fireCoursesObservable);
export const useMyCourses: () => readonly FireCourse[] =
    createUseSingletonObservableHook(fireCoursesSingletonObservable);
