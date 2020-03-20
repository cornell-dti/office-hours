import { useState, useEffect } from 'react';

import { firestore, loggedIn$ } from './firebase';
import { collectionData, docData } from 'rxfire/firestore';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
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

// Pass in a query parameter and a firebase query generator and return the results.
// The indirection through query parameter is important because useEffect does shallow
// comparisons on the objects in the array for memoization. Without storing
// the query, we re-render and re-fetch infinitely.
export const useQueryWithLoading = <T, P=string>(
    queryParameter: P, getQuery: (parameter: P) => firebase.firestore.Query, idField: string
): T[] | null => {
    const [result, setResult] = useState<T[] | null>(null);
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
export const useQuery = <T, P=string>(
    queryParameter: P, getQuery: (parameter: P) => firebase.firestore.Query, idField: string
): T[] => useQueryWithLoading(queryParameter, getQuery, idField) || [];

const myUserObservable = loggedIn$.pipe(
    switchMap(u =>
        docData(firestore.doc('users/' + u.uid), 'userId') as Observable<FireUser>
    )
);
export const myUserSingletonObservable = new SingletonObservable(undefined, myUserObservable);
export const useMyUser: () => FireUser | undefined = createUseSingletonObservableHook(myUserSingletonObservable);

const allCoursesObservable: Observable<readonly FireCourse[]> = loggedIn$.pipe(
    switchMap(() => collectionData<FireCourse>(firestore.collection('courses'), 'courseId'))
);
const allCoursesSingletonObservable = new SingletonObservable([], allCoursesObservable);
export const useAllCourses: () => readonly FireCourse[] =
    createUseSingletonObservableHook(allCoursesSingletonObservable);

export const useMyCourses = (): readonly FireCourse[] => {
    const allCourses = useAllCourses();
    const user = useMyUser();
    if (user === undefined) {
        return [];
    }
    const currentlyEnrolledCourseIds = new Set(user.courses);
    return allCourses.filter(({ courseId }) => currentlyEnrolledCourseIds.has(courseId));
};

const courseTagQuery = (courseId: string) => firestore.collection('tags').where('courseId', '==', courseId);
export const useCourseTags = (courseId: string): { readonly [tagId: string]: FireTag } => {
    const tagsList = useQuery<FireTag>(courseId, courseTagQuery, 'tagId');
    const tags: { [tagId: string]: FireTag } = {};

    tagsList.forEach(tag => {
        tags[tag.tagId] = tag;
    });

    return tags;
};

const courseUserQuery = (courseId: string) => (
    firestore.collection('users').where('courses', 'array-contains', courseId)
);
export const useUsersInCourse = (courseId: string): readonly FireUser[] => (
    useQuery<FireUser>(courseId, courseUserQuery, 'userId')
);

// Primatives
// Look up a doc in Firebase by ID
export const useCourse = (courseId: string | undefined): FireCourse | undefined =>
    useAllCourses().find(course => course.courseId === courseId);
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
