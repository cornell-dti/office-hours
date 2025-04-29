import { useState, useEffect } from 'react';

import { docData } from 'rxfire/firestore';
import { switchMap, map } from 'rxjs/operators';
import { Observable, of, combineLatest, EMPTY } from 'rxjs';
import moment from 'moment';
import { collection, doc, query, where, orderBy, limit, documentId, Query, DocumentData } from 'firebase/firestore';
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
                docData(doc(firestore, collectionDoc, id), {idField: idFieldArg}) as Observable<T>;
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
            const results$:Observable<DocumentData> = collectionData(getQuery(queryParameter), {idField: idFieldArg});

            // updates results as they come in. Triggers re-renders.
            const subscription = results$.subscribe(results => {
                const mappedResults: T[] = results.map((result: DocumentData) => {
                    // Safely map or cast DocumentData to T (e.g., FireTag or FireHybridSession)
                    return result as T;
                });
                setResult(mappedResults);
            });

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
                const results$: Observable<DocumentData[]> = collectionData(getQuery, {idField: idFieldArg});

                // updates results as they come in. Triggers re-renders.
                const subscription = results$.subscribe(results => {
                    partialResult = [...partialResult, ...results.map(result => result as T)];
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
            const results$: Observable<FireSession[]> = collectionData(sessionsQuery, {idField:'sessionId'}).pipe(
                map((docs:DocumentData) => docs as FireSession[]) // Type assertion
            );

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
            const sessionsRef = collection(firestore, 'sessions');
            const sessionsQuery = query(sessionsRef, 
                where('startTime', '>=', startDate.toDate()),
                where('startTime', '<=', endDate.add(1, 'day').toDate()),
                where('courseId', '==', courseId)
            );

            const sessions$: Observable<FireSession[]> = collectionData(sessionsQuery, {idField: 'sessionId'}).pipe(
                map((docs: DocumentData) => docs as FireSession[])
            );
            const s1 = sessions$.subscribe(newSessions => setSessions(newSessions));

            const questionsRef = collection(firestore, 'questions');
            
            const questions$: Observable<FireQuestion[][]> = sessions$.pipe(
                switchMap(sessions => {
                    if (sessions.length === 0) return EMPTY;
                    
                    const sessionIds = sessions.map(s => s.sessionId);
                    
                    const questionsQuery = query(
                        questionsRef,
                        where('sessionId', 'in', sessionIds),
                        orderBy('sessionId'),
                        orderBy('timeEntered', 'asc')
                    );

                    return collectionData(questionsQuery, {idField: 'questionId'}).pipe(
                        map((docs: DocumentData[]) => {
                            // Group questions by sessionId
                            const questionsBySession = new Map<string, FireQuestion[]>();
                            docs.forEach(doc => {
                                const question = doc as FireQuestion;
                                const sessionQuestions = questionsBySession.get(question.sessionId) || [];
                                sessionQuestions.push(question);
                                questionsBySession.set(question.sessionId, sessionQuestions);
                            });

                            return sessions.map(session => 
                                questionsBySession.get(session.sessionId) || []
                            );
                        })
                    );
                })
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
        docData(doc(firestore, 'users', u.uid), {idField: 'userId'}) as Observable<FireUser>
        : EMPTY
    )
);

export const myUserSingletonObservable = new SingletonObservable(undefined, myUserObservable);
export const useMyUser: () => FireUser | undefined = createUseSingletonObservableHook(myUserSingletonObservable);

const allUsersObservable: Observable<readonly FireUser[]> = loggedIn$.pipe(
    switchMap(() => {
        const usersRef = collection(firestore, 'users');
        const usersQuery = query(
            usersRef,
            orderBy('lastName', 'asc'),
            orderBy('firstName', 'asc'),
            limit(100) 
        );
        return collectionData(usersQuery, {idField: 'userId'}).pipe(
            map((docs: DocumentData[]) => docs as FireUser[])
        );
    })
);

const allUsersSingletonObservable = new SingletonObservable([], allUsersObservable);

export const useAllUsers: () => readonly FireUser[] =
    createUseSingletonObservableHook(allUsersSingletonObservable);


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
    switchMap(() => collectionData(collection(firestore,'courses') , {idField: 'courseId'}).pipe(
        map((docs: DocumentData[]) => docs as FireCourse[])
    ))
);

const getAskerQuestionsQuery = (sessionId: string, askerId: string) => {
    const questionsRef = collection(firestore, 'questions');
    return query(questionsRef, where('sessionId', '==', sessionId), where('askerId', '==', askerId));
};
const useParameterizedAskerQuestions = createUseParamaterizedSingletonObservableHook(parameter => {
    const [sessionId, askerId] = parameter.split('/');

    const askerQuery = getAskerQuestionsQuery(sessionId, askerId);
    return new SingletonObservable([], 
        collectionData<FireQuestion>(askerQuery as Query<FireQuestion, DocumentData>, {idField: 'questionId'}));
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
        courseId === '' ? of([]) : collectionData(courseUserQuery(courseId), 
            {idField:'userId'}) as Observable<FireUser[]>
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

const allSessionsObservable: Observable<readonly FireSession[]> = loggedIn$.pipe(
    switchMap(() => collectionData(collection(firestore, 'sessions')).pipe(
        map((docs: DocumentData[]) => docs as FireSession[])
    ))
);

const allSessionsSingletonObservable = new SingletonObservable([], allSessionsObservable);

export const useAllSessions: () => readonly FireSession[] =
    createUseSingletonObservableHook(allSessionsSingletonObservable);

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

const allQuestionsObservable: Observable<readonly FireQuestion[]> = loggedIn$.pipe(
    switchMap(() => {
        const questionsRef = collection(firestore, 'questions');
        const questionsQuery = query(
            questionsRef,
            orderBy('timeEntered', 'desc'), // most recent first
            where('timeEntered', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // only 30 days
            limit(100)
        );
        return collectionData(questionsQuery, {idField: 'questionId'}).pipe(
            map((docs: DocumentData[]) => docs as FireQuestion[])
        );
    })
);

const allQuestionsSingletonObservable = new SingletonObservable([], allQuestionsObservable);

export const useAllQuestions: () => readonly FireQuestion[] =
    createUseSingletonObservableHook(allQuestionsSingletonObservable);

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
    return new SingletonObservable([], collectionData(q, {idField: 'questionId'}) as Observable<FireQuestion[]>);
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
        collectionData(query(collection(firestore,'blogPosts'),orderBy("timeEntered", "desc")), {idField: 'postId'})
            .pipe(
                map((docs:DocumentData[]) => docs as BlogPost[])
            ))
);

const allBlogPostsSingletonObservable = new SingletonObservable([], allBlogPostsObservable);

export const useAllBlogPosts: () => readonly BlogPost[] =
    createUseSingletonObservableHook(allBlogPostsSingletonObservable);

export const useParameterizedComments: (questionId: string) => readonly FireComment[] =
    createUseParamaterizedSingletonObservableHook(questionId => {
        const commentsRef = collection(doc(firestore, 'questions', questionId), 'comments');
        return new SingletonObservable([], collectionData(commentsRef, {idField: 'commentId'}).pipe(
            map((docs: DocumentData[]) => docs as FireComment[])
        ));
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