import { useState, useEffect } from 'react';

import type * as firebase from 'firebase/app';

import { firestore } from 'firebase';

import { collectionData, docData } from 'rxfire/firestore';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { firestore as db, auth, loggedIn$ } from './firebaseApp';
import {
    SingletonObservable,
    createUseSingletonObservableHook,
    createUseParamaterizedSingletonObservableHook
} from './utilities/singleton-observable-hook';
import { userUpload } from './firefunctions';

export const getTagsQuery = (courseId: string) => db
    .collection('tags')
    .where('courseId', '==', courseId);

/**
 * 0: Fetching currently logged in status
 * 1: Not logged in
 * 2: Logged in
 */
export const useLoginStatus = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<0 | 1 | 2>(0);

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setIsLoggedIn(2);
                userUpload(user);
            } else {
                setIsLoggedIn(1);
            }
        });
    }, []);

    return isLoggedIn;
};

// Fetching all questions for a course might be expensive/have performance implications
// This should be rarely done, though.
export const getQuestionsQuery = (courseId: string) => db
    .collection('questions')
    .where('courseId', '==', courseId);

export const useDoc = <T>(collection: string, id: string | undefined, idField: string) => {
    const [doc, setDoc] = useState<T | undefined>();
    useEffect(
        () => {
            if (id) {
                const primaryTag$: Observable<T> = docData(db.doc(collection + '/' + id), idField);
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

/**
 * Pass in a query parameter and a firebase query generator and return the results.
 * The indirection through query parameter is important because useEffect does shallow
 * comparisons on the objects in the array for memoization. Without storing
 * the query, we re-render and re-fetch infinitely.
 */
export const useQueryWithLoading = <T, P = string>(
    queryParameter: P, getQuery: (parameter: P) => firebase.firestore.Query, idField: string
): T[] | null => {
    const [result, setResult] = useState<T[] | null>(null);

    useEffect(
        () => {
            const results$: Observable<T[]> = collectionData(getQuery(queryParameter), idField);

            // updates results as they come in. Triggers re-renders.
            const subscription = results$.subscribe(results => setResult(results));
            return () => { subscription.unsubscribe(); };
        },
        [queryParameter, getQuery, idField]
    );
    return result;
};

export const useBatchQueryWithLoading = <T, P = string>(
    queryParameter: P, getQueries: (parameter: P) => (firebase.firestore.Query)[], idField: string
): T[] | null => {
    const [result, setResult] = useState<T[] | null>(null);

    useEffect(
        () => {
            let partialResult: T[] = [];

            const effects = getQueries(queryParameter).map(getQuery => {
                const results$: Observable<T[]> = collectionData(getQuery, idField);

                // updates results as they come in. Triggers re-renders.
                const subscription = results$.subscribe(results => {
                    partialResult = [...partialResult, ...results];
                    setResult(partialResult);
                })
                return () => { subscription.unsubscribe(); };
            });


            return () => {
                effects.forEach(unsubscription => unsubscription());
            }

        },
        [queryParameter, getQueries, idField]
    );
    return result;
};


export const useQuery = <T, P = string>(
    queryParameter: P,
    getQuery: (parameter: P) => firebase.firestore.Query,
    idField: string
): T[] => useQueryWithLoading(queryParameter, getQuery, idField) || [];

export const useBatchQuery = <T, P = string>(
    queryParameter: P,
    getQuery: (parameter: P) => firebase.firestore.Query[],
    idField: string
): T[] => useBatchQueryWithLoading(queryParameter, getQuery, idField) || [];

const myUserObservable = loggedIn$.pipe(
    switchMap(u =>
        docData(db.doc('users/' + u.uid), 'userId') as Observable<FireUser>
    )
);
export const myUserSingletonObservable = new SingletonObservable(undefined, myUserObservable);
export const useMyUser: () => FireUser | undefined = createUseSingletonObservableHook(myUserSingletonObservable);

const allCoursesObservable: Observable<readonly FireCourse[]> = loggedIn$.pipe(
    switchMap(() => collectionData<FireCourse>(db.collection('courses'), 'courseId'))
);

const getAskerQuestionsQuery = (sessionId: string, askerId: string) => {
    return db.collection('questions')
        .where('sessionId', '==', sessionId)
        .where('askerId', '==', askerId);
};
const useParameterizedAskerQuestions = createUseParamaterizedSingletonObservableHook(parameter => {
    const [sessionId, askerId] = parameter.split('/');

    const query = getAskerQuestionsQuery(sessionId, askerId);
    return new SingletonObservable([], collectionData<FireQuestion>(query, 'questionId'));
});
export const useAskerQuestions = (sessionId: string, askerId: string): null | FireQuestion[] => {
    return useParameterizedAskerQuestions(`${sessionId}/${askerId}`);
}

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

const courseTagQuery = (courseId: string) => db.collection('tags').where('courseId', '==', courseId);
export const useCourseTagList = (courseId: string): FireTag[] => {
    const tagsList = useQuery<FireTag>(courseId, courseTagQuery, 'tagId');

    return tagsList;
};
export const useCourseTags = (courseId: string): { readonly [tagId: string]: FireTag } => {
    const tagsList = useCourseTagList(courseId);
    const tags: { [tagId: string]: FireTag } = {};

    tagsList.forEach(tag => {
        tags[tag.tagId] = tag;
    });

    return tags;
};

const courseQuestionQuery = (courseId: string) => db.collection('questions').where('courseId', '==', courseId);
export const useCourseQuestions = (courseId: string): FireQuestion[] => {
    const questions = useQuery<FireQuestion>(courseId, courseQuestionQuery, 'questionId');

    return questions;
};

const courseUserQuery = (courseId: string) => (
    db.collection('users').where('courses', 'array-contains', courseId)
);
export const useCourseUsers = createUseParamaterizedSingletonObservableHook(courseId =>
    new SingletonObservable(
        [],
        courseId === '' ? of([]) : collectionData<FireUser>(courseUserQuery(courseId), 'userId')
    )
);
type FireUserMap = { readonly [userId: string]: FireUser };
export const useCourseUsersMap = (courseId: string, canReadUsers: boolean): FireUserMap => {
    const courseUsers = useCourseUsers(canReadUsers ? courseId : '');
    const map: { [userId: string]: FireUser } = {};

    courseUsers.forEach(user => {
        map[user.userId] = user;
    });

    return map;
};

const dummyProfessorOrTAList = ['DUMMY'];

const courseProfessorOrTaBatchQuery = (professorsOrTas: readonly string[]) => {
    const blocks = blockArray(professorsOrTas.length === 0 ? dummyProfessorOrTAList : professorsOrTas, 10);

    return blocks.map(block => db.collection('users').where(
        firestore.FieldPath.documentId(),
        'in',
        block
    ));
};

export const blockArray = <T>(arr: readonly T[], blockSize: number) => {
    let result: T[][] = [];
    for (let i = 0; i < arr.length; i += blockSize) {
        result = [...result, arr.slice(i, Math.min(arr.length, i + blockSize))];
    }

    return result;
}

const useCourseCourseProfessorOrTaMap = (course: FireCourse, type: 'professor' | 'ta'): FireUserMap => {
    const courseUsers = useBatchQuery<FireUser, readonly string[]>(
        type === 'professor' ? course.professors : course.tas,
        courseProfessorOrTaBatchQuery,
        'userId'
    );
    const map: { [userId: string]: FireUser } = {};

    courseUsers.forEach(user => {
        map[user.userId] = user;
    });

    return map;
};
export const useCourseProfessorMap = (course: FireCourse): FireUserMap => (
    useCourseCourseProfessorOrTaMap(course, 'professor')
);
export const useCourseTAMap = (course: FireCourse): FireUserMap => useCourseCourseProfessorOrTaMap(course, 'ta');


const dummySession = { courseId: 'DUMMY', tas: [] };
export const useSessionTAs = (
    course: FireCourse,
    session: Pick<FireSession, 'courseId' | 'tas'> = dummySession,
): readonly FireUser[] => {
    const courseUsers = { ...useCourseProfessorMap(course), ...useCourseTAMap(course) };
    const tas: FireUser[] = [];
    session.tas.forEach(userId => {
        const courseUser = courseUsers[userId];
        if (courseUser === undefined) {
            return;
        }
        tas.push(courseUser);
    });
    return tas;
};
export const useSessionTANames = (
    course: FireCourse,
    session: Pick<FireSession, 'courseId' | 'tas'> = dummySession
): readonly string[] => {
    return useSessionTAs(course, session).map(courseUser => `${courseUser.firstName} ${courseUser.lastName}`)
};

const getSessionQuestionsQuery = (sessionId: string) => db.collection('questions')
    .where('sessionId', '==', sessionId)
    .orderBy('timeEntered', 'asc');
const getSessionQuestionSlotsQuery = (sessionId: string) => db.collection('questionSlots')
    .where('sessionId', '==', sessionId)
    .orderBy('timeEntered', 'asc');
const useParameterizedSessionQuestions = createUseParamaterizedSingletonObservableHook(parameter => {
    const [sessionId, isTA] = parameter.split('/');
    const query = isTA === 'true' ? getSessionQuestionsQuery(sessionId) : getSessionQuestionSlotsQuery(sessionId);
    return new SingletonObservable([], collectionData<FireQuestion>(query, 'questionId'));
});
export const useSessionQuestions = (sessionId: string, isTA: boolean): FireQuestion[] =>
    useParameterizedSessionQuestions(`${sessionId}/${isTA}`);

export const useSessionProfile: (
    userId: string | undefined,
    sessionId: string | undefined
) => FireVirtualSessionProfile | undefined =
    (userId, sessionId) => useDoc(`/sessions/${sessionId}/profiles`, userId, 'userId');

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
