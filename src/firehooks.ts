import { useState, useEffect } from 'react';

import firebase from 'firebase/app';
import { collectionData, docData } from 'rxfire/firestore';
import { switchMap } from 'rxjs/operators';
import { Observable, of, combineLatest } from 'rxjs';
import moment from 'moment';
import { firestore, loggedIn$ } from './firebase';
import {
    SingletonObservable,
    createUseSingletonObservableHook,
    createUseParamaterizedSingletonObservableHook
} from './utilities/singleton-observable-hook';


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

export const useProfessorViewSessions = (
    courseId: string, 
    selectedWeekEpoch: number 
) => {
    const [result, setResult] = useState<FireSession[]>([]);

    useEffect(
        () => {
            const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;
            const results$: Observable<FireSession[]> = collectionData(
                firestore
                    .collection('sessions')
                    .where('courseId', '==', courseId)
                    .where('startTime', '>=', new Date(selectedWeekEpoch))
                    .where('startTime', '<=', new Date(selectedWeekEpoch + 7 * ONE_DAY)), 'sessionId');

            const subscription = results$.subscribe(results => setResult(results));
            return () => { subscription.unsubscribe(); };
        },
        [courseId, selectedWeekEpoch]
    );
    return result;
};

export const useCoursesBetweenDates = (
    startDate: moment.Moment, 
    endDate: moment.Moment, 
    courseId: string
) => {
    const [sessions, setSessions] = useState<FireSession[]>([]);
    const [questions, setQuestions] = useState<FireQuestion[][]>([]);

    useEffect(
        () => {
            const sessions$: Observable<FireSession[]> = collectionData(
                firestore
                    .collection('sessions')
                    .where('startTime', '>=', startDate.toDate())
                    .where('startTime', '<=', endDate.add(1, 'day').toDate())
                    .where('courseId', '==', courseId),
                'sessionId'
            );
            const s1 = sessions$.subscribe(newSessions => setSessions(newSessions));

            // Fetch all questions for given sessions
            const questions$ = sessions$.pipe(
                switchMap(s =>
                    combineLatest(...s.map(session =>
                        collectionData(
                            firestore.collection('questions').where('sessionId', '==', session.sessionId),
                            'questionId'
                        )
                    ))
                )
            );

            const s2 = questions$.subscribe((newQuestions: FireQuestion[][]) => setQuestions(newQuestions));
            return () => {
                s1.unsubscribe();
                s2.unsubscribe();
            };
        },
        [courseId, startDate, endDate]
    );

    return {sessions, questions}
}

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
        docData(firestore.doc('users/' + u.uid), 'userId') as Observable<FireUser>
    )
);
export const myUserSingletonObservable = new SingletonObservable(undefined, myUserObservable);
export const useMyUser: () => FireUser | undefined = createUseSingletonObservableHook(myUserSingletonObservable);

const needsPromotionObservable = loggedIn$.pipe(
    switchMap(u =>
        docData(firestore.doc('pendingUsers/' + u.email)) as Observable<FirePendingUser>
    )
)

export const needsPromotionSingletonObservable = new SingletonObservable(undefined, needsPromotionObservable);

export const usePendingUser: () => FirePendingUser | undefined  = 
    createUseSingletonObservableHook(needsPromotionSingletonObservable);

const isAdminObservable = loggedIn$.pipe(
    switchMap(u => 
        docData(firestore.doc('admins/' + u.email)) as Observable<{}>
    )
)

export const isAdminSingletonObservable = new SingletonObservable(undefined, isAdminObservable);

export const useIsAdmin: () => {} | undefined = 
    createUseSingletonObservableHook(isAdminSingletonObservable);

const allCoursesObservable: Observable<readonly FireCourse[]> = loggedIn$.pipe(
    switchMap(() => collectionData<FireCourse>(firestore.collection('courses'), 'courseId'))
);

const getAskerQuestionsQuery = (sessionId: string, askerId: string) => {
    return firestore.collection('questions')
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

    return blocks.map(block => firestore.collection('users').where(
        firebase.firestore.FieldPath.documentId(),
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
): readonly string[] => (
    useSessionTAs(course, session).map(courseUser => `${courseUser.firstName} ${courseUser.lastName}`)
);

const getSessionQuestionsQuery = (sessionId: string) => firestore.collection('questions')
    .where('sessionId', '==', sessionId)
    .orderBy('timeEntered', 'asc');
const getSessionQuestionSlotsQuery = (sessionId: string) => firestore.collection('questionSlots')
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

const allBlogPostsObservable: Observable<readonly BlogPost[]> = loggedIn$.pipe(
    switchMap(() => 
        collectionData<BlogPost>(firestore.collection('blogPosts').orderBy("timeEntered", "desc"), 'postId'))
);

const allBlogPostsSingletonObservable = new SingletonObservable([], allBlogPostsObservable);

export const useAllBlogPosts: () => readonly BlogPost[] =
    createUseSingletonObservableHook(allBlogPostsSingletonObservable);


export const useProductUpdate= (): BlogPost | undefined => useAllBlogPosts()[0]

export const useNotificationTracker = 
(trackerId: string | undefined): NotificationTracker | undefined =>
    useDoc<NotificationTracker>('notificationTrackers', trackerId, 'trackerId')

export const useNotifications = 
(trackerId: string | undefined): SessionNotification[] | undefined => 
    useNotificationTracker(trackerId)?.notificationList.reverse();

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
    
export const getTagsQuery = (courseId: string) => firestore
    .collection('tags')
    .where('courseId', '==', courseId);

export const getQuestionsQuery = (courseId: string) => firestore
    .collection('questions')
    .where('courseId', '==', courseId);