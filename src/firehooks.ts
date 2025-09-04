import { useState, useEffect, useMemo } from 'react';

import { docData } from 'rxfire/firestore';
import { switchMap, map } from 'rxjs/operators';
import { Observable, of, EMPTY, combineLatest } from 'rxjs';
import moment from 'moment';
import { collection, doc, query, where, orderBy, documentId, Query, DocumentData } from 'firebase/firestore';
import { firestore, loggedIn$, collectionData } from './firebase';
import {
    SingletonObservable,
    createUseSingletonObservableHook,
    createUseParamaterizedSingletonObservableHook
} from './utilities/singleton-observable-hook';


export const useDoc = <T>(collectionDoc: string, id: string | undefined, idFieldArg: string) => {
    const [document, setDocument] = useState<T | undefined>();
    useEffect(
        () => {
            if (id) {
                const primaryTag$: Observable<T> = 
                docData(doc(firestore, collectionDoc, id), idFieldArg);
                const subscription = primaryTag$.subscribe((d:T) => {
                    if (!d) {
                        // eslint-disable-next-line no-console
                        console.warn(`Firestore document ${collectionDoc}/${id} is undefined or null.`);
                    } else if (typeof d !== "object") {
                        // eslint-disable-next-line no-console
                        console.error(`Unexpected Firestore data type:`, d);
                    }
                    setDocument(d);
                });
                return () => { subscription.unsubscribe(); };
            }
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            return () => { };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [collectionDoc, id, idFieldArg, docData, firestore]
    );
    return document;
};

/**
 * Pass in a query parameter and a firebase query generator and return the results.
 * The indirection through query parameter is important because useEffect does shallow
 * comparisons on the objects in the array for memoization. Without storing
 * the query, we re-render and re-fetch infinitely.
 */
export const useQueryWithLoading = <T, P = string>(
    queryParameter: P, getQuery: (parameter: P) => Query, idFieldArg: string
): T[] | null => {
    const [result, setResult] = useState<T[] | null>(null);
    useEffect(
        () => {
            
            const results$:Observable<T[]> = collectionData(getQuery(queryParameter), idFieldArg);

            // updates results as they come in. Triggers re-renders.
            const subscription = results$.subscribe(results => setResult(results));
            return () => { subscription.unsubscribe(); };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [queryParameter, getQuery, idFieldArg, collectionData]
    );
    return result;
};

export const useBatchQueryWithLoading = <T, P = string>(
    queryParameter: P, getQueries: (parameter: P) => (Query)[], idFieldArg: string
): T[] | null => {
    const [result, setResult] = useState<T[] | null>(null);
    useEffect(
        () => {
            let partialResult: T[] = [];
            const effects = getQueries(queryParameter).map(getQuery => {
                const results$: Observable<T[]> = collectionData(getQuery, idFieldArg);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [queryParameter, getQueries, idFieldArg, collectionData]
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
            const sessionsRef = collection(firestore, 'sessions');
            const sessionsQuery = query(sessionsRef, where('courseId', '==', courseId),
                where('startTime', '>=', new Date(selectedWeekEpoch)),
                where('startTime', '<=', new Date(selectedWeekEpoch + 7 * ONE_DAY)));
            const results$: Observable<FireSession[]> = collectionData(sessionsQuery,
                'sessionId');

            const subscription = results$.subscribe(results => setResult(results));
            return () => { subscription.unsubscribe();
            };
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
            const sessionsRef = collection(firestore, 'sessions');
            const sessionsQuery = query(sessionsRef, 
                where('startTime', '>=', startDate.toDate()),
                where('startTime', '<=', endDate.add(1, 'day').toDate()),
                where('courseId', '==', courseId)
            );

            const sessions$: Observable<FireSession[]> = collectionData(sessionsQuery, 
                'sessionId');
            const s1 = sessions$.subscribe(newSessions => setSessions(newSessions));

            const questionsRef = collection(firestore, 'questions');
            // Fetch all questions for given sessions
            const questions$ = sessions$.pipe(
                switchMap(s => {
                    return s.length > 0 ?
                        combineLatest(...s.map(session => {
                            const questionsQuery = query(
                                questionsRef,
                                where('sessionId', '==', session.sessionId)
                            );
                            return collectionData(questionsQuery, 'questionId')
                        }
                        )) : EMPTY;}
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

    return { sessions, questions }
}

export const useQuery = <T, P = string>(
    queryParameter: P,
    getQuery: (parameter: P) => Query,
    idField: string
): T[] => useQueryWithLoading(queryParameter, getQuery, idField) || [];

export const useBatchQuery = <T, P = string>(
    queryParameter: P,
    getQuery: (parameter: P) => Query[],
    idField: string
): T[] => useBatchQueryWithLoading(queryParameter, getQuery, idField) || [];

const myUserObservable = loggedIn$.pipe(
    switchMap(u => u && u.uid ?
        docData(doc(firestore, 'users', u.uid), 'userId') as Observable<FireUser>
        : EMPTY
    )
);

export const myUserSingletonObservable = new SingletonObservable(undefined, myUserObservable);
export const useMyUser: () => FireUser | undefined = createUseSingletonObservableHook(myUserSingletonObservable);


const needsPromotionObservable = loggedIn$.pipe(
    switchMap(u => u && u.email ? 
        docData(doc(firestore, 'pendingUsers', u.email)) as Observable<FirePendingUser> : EMPTY
    )
)

export const needsPromotionSingletonObservable = new SingletonObservable(undefined, needsPromotionObservable);

export const usePendingUser: () => FirePendingUser | undefined =
    createUseSingletonObservableHook(needsPromotionSingletonObservable);


const pendingUsersQuery = (courseId: string) => {
    const usersRef = collection(firestore, 'pendingUsers');
    return query(usersRef, where(`roles.${courseId}`, 'in', ['professor', 'ta']));
}

export const usePendingUsers = (courseId: string): readonly FirePendingUser[] => {
    const pendingUsers = useQuery<FirePendingUser>(courseId, pendingUsersQuery, 'courseId');
    return pendingUsers;
}

const isAdminObservable = loggedIn$.pipe(
    switchMap(u => u && u.email?
        docData(doc(firestore, 'admins', u.email)) as Observable<unknown>: EMPTY
    )
)

export const isAdminSingletonObservable = new SingletonObservable(undefined, isAdminObservable);

export const useIsAdmin: () => unknown =
    createUseSingletonObservableHook(isAdminSingletonObservable);

const allCoursesObservable: Observable<readonly FireCourse[]> = loggedIn$.pipe(
    switchMap(() => collectionData<FireCourse>(collection(firestore,'courses') , 'courseId'))
);

const getAskerQuestionsQuery = (sessionId: string, askerId: string) => {
    const questionsRef = collection(firestore, 'questions');
    return query(questionsRef, where('sessionId', '==', sessionId), where('askerId', '==', askerId));
};
const useParameterizedAskerQuestions = createUseParamaterizedSingletonObservableHook(parameter => {
    const [sessionId, askerId] = parameter.split('/');
    const askerQuery = getAskerQuestionsQuery(sessionId, askerId);
    return new SingletonObservable([], 
        collectionData<FireQuestion>(askerQuery,'questionId'));
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

const courseTagQuery = (courseId: string) => {
    const tagRef = collection(firestore, 'tags');
    return query(tagRef, where('courseId', '==', courseId));
}

export const useCourseTags = (courseId: string): { readonly [tagId: string]: FireTag } => {
    const tagsList = useQuery<FireTag>(courseId, courseTagQuery, 'tagId');
    const tags: { [tagId: string]: FireTag } = {};

    tagsList.forEach(tag => {
        tags[tag.tagId] = tag;
    });

    return tags;
};


const courseUserQuery = (courseId: string) => (
    query(collection(firestore,'users'), where('courses', 'array-contains', courseId))
);
export const useCourseUsers = createUseParamaterizedSingletonObservableHook(courseId =>
    new SingletonObservable(
        [],
        courseId === '' ? of([]) : collectionData<FireUser>(courseUserQuery(courseId), 
            'userId'))
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

    return blocks.map(block => query(collection(firestore,'users'),where(
        documentId(),
        'in',
        block
    )));
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
    const mapping: { [userId: string]: FireUser } = {};

    courseUsers.forEach(user => {
        mapping[user.userId] = user;
    });

    return mapping;
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

const getSessionQuestionsQuery = (sessionId: string) => 
    query(collection(firestore,'questions')
        ,where('sessionId', '==', sessionId)
        ,orderBy('timeEntered', 'asc'));
const getSessionQuestionSlotsQuery = (sessionId: string) =>     
    query(collection(firestore,'questionSlots')
        ,where('sessionId', '==', sessionId)
        ,orderBy('timeEntered', 'asc'));

const useParameterizedSessionQuestions = createUseParamaterizedSingletonObservableHook(parameter => {
    const [sessionId, isTA] = parameter.split('/');
    const q = isTA === 'true' ? getSessionQuestionsQuery(sessionId) : getSessionQuestionSlotsQuery(sessionId);
    return new SingletonObservable([], collectionData<FireQuestion>(q, 'questionId'));
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
        collectionData<BlogPost>(query(collection(firestore,'blogPosts'),orderBy("timeEntered", "desc")), 
             'postId'))
    );

const allBlogPostsSingletonObservable = new SingletonObservable([], allBlogPostsObservable);

export const useAllBlogPosts: () => readonly BlogPost[] =
    createUseSingletonObservableHook(allBlogPostsSingletonObservable);

export const useParameterizedComments: (questionId: string) => readonly FireComment[] =
    createUseParamaterizedSingletonObservableHook(questionId => {
        const commentsRef = collection(doc(firestore, 'questions', questionId), 'comments');
        return new SingletonObservable([], 
            collectionData<FireComment>(commentsRef, 'commentId'));
    });


export const useProductUpdate = (): BlogPost | undefined => useAllBlogPosts()[0]

export const useNotificationTracker =
    (trackerId: string | undefined): NotificationTracker | undefined => 
        useDoc<NotificationTracker>('notificationTrackers', trackerId, 'trackerId');


export const useNotifications =
    (trackerId: string | undefined): SessionNotification[] | undefined =>
        useNotificationTracker(trackerId)?.notificationList;

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

export const getTagsQuery = (courseId: string) => query(
    collection(firestore,'tags')
    ,where('courseId', '==', courseId));

export const getQuestionsQuery = (courseId: string) => query(
    collection(firestore,'questions')
    ,where('courseId', '==', courseId));