import { useState, useEffect } from 'react';
import { doc as getDocumentReference, collection, query, where, Query, orderBy, documentId } from 'firebase/firestore';

import { Observable, of, combineLatest, EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import moment from 'moment';
import { authState } from 'rxfire/auth';
import { collectionData, docData } from 'rxfire/firestore';

import { auth, firestore } from './firebase';
import {
    SingletonObservable,
    createUseSingletonObservableHook,
    createUseParamaterizedSingletonObservableHook
} from './utilities/singleton-observable-hook';

export const useDoc = <T>(collectionPath: string, id: string | undefined, idField: string) => {
    const [doc, setDoc] = useState<T | undefined>();

    useEffect(() => {
        if (id) {
            const docRef = getDocumentReference(firestore, collectionPath, id);
            const primaryTag$: Observable<T> = docData(docRef, idField);
            const subscription = primaryTag$.subscribe(setDoc);
            return () => subscription.unsubscribe();
        }
        return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionPath, id, idField]);

    return doc;
};

export const useQueryWithLoading = <T, P = string>(
    queryParameter: P, getQueryFn: (parameter: P) => Query, idField: string
): T[] | null => {
    const [result, setResult] = useState<T[] | null>(null);

    useEffect(() => {
        const queryInstance = getQueryFn(queryParameter);
        const results$: Observable<T[]> = collectionData(queryInstance, idField);
        const subscription = results$.subscribe(setResult);
        return () => subscription.unsubscribe();
    }, [queryParameter, getQueryFn, idField]);

    return result;
};

export const useBatchQueryWithLoading = <T, P = string>(
    queryParameter: P, getQueries: (parameter: P) => Query[], idField: string
): T[] | null => {
    const [result, setResult] = useState<T[] | null>(null);

    useEffect(() => {
        const queries = getQueries(queryParameter);
        const results$: Observable<T[]>[] = queries.map(query => collectionData(query, idField));
        const subscription = combineLatest(results$).subscribe(results => {
            setResult(results.flat());
        });

        return () => subscription.unsubscribe();
    }, [queryParameter, getQueries, idField]);

    return result;
};

export const useProfessorViewSessions = (
    courseId: string,
    selectedWeekEpoch: number
) => {
    const ONE_DAY = 86400000; // 24 * 60 * 60 * 1000
    const [result, setResult] = useState<FireSession[]>([]);

    useEffect(() => {
        const start = new Date(selectedWeekEpoch);
        const end = new Date(selectedWeekEpoch + 7 * ONE_DAY);
        const sessionsQuery = query(collection(firestore, 'sessions'),
            where('courseId', '==', courseId),
            where('startTime', '>=', start),
            where('startTime', '<=', end)
        );
        const results$: Observable<FireSession[]> = collectionData(sessionsQuery, 'sessionId');
        const subscription = results$.subscribe(setResult);

        return () => subscription.unsubscribe();
    }, [courseId, selectedWeekEpoch]);

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
                query(collection(firestore, 'sessions'),
                    where('startTime', '>=', startDate.toDate()),
                    where('startTime', '<=', endDate.add(1, 'day').toDate()),
                    where('courseId', '==', courseId)),
                'sessionId'
            );
            const s1 = sessions$.subscribe((newSessions: FireSession[]) => setSessions(newSessions));

            // Fetch all questions for given sessions
            const questions$ = sessions$.pipe(
                switchMap(s => {
                    return s.length > 0 ?
                        combineLatest(...s.map(session =>
                            collectionData<FireQuestion>(
                                query(collection(firestore, 'questions'), where('sessionId', '==', session.sessionId)),
                                'questionId'
                            )
                        )) : EMPTY;
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
    getQueryFn: (parameter: P) => Query,
    idField: string
): T[] => useQueryWithLoading(queryParameter, getQueryFn, idField) || [];

export const useBatchQuery = <T, P = string>(
    queryParameter: P,
    getQueries: (parameter: P) => Query[],
    idField: string
): T[] => useBatchQueryWithLoading(queryParameter, getQueries, idField) || [];

const loggedIn$ = authState(auth).pipe(
    switchMap(user => {
        if (!user) return EMPTY;
        return of(user);
    })
);

const userDoc$ = loggedIn$.pipe(
    switchMap(user => {
        const userRef = getDocumentReference(firestore, 'users', user.uid);
        return docData(userRef, 'userId') as Observable<FireUser>;
    })
);

export const useMyUser = createUseSingletonObservableHook(new SingletonObservable(undefined, userDoc$));

const needsPromotionObservable = loggedIn$.pipe(
    switchMap(u =>
        docData(getDocumentReference(collection(firestore, 'pendingUsers'), u.email)) as Observable<FirePendingUser>
    )
)

export const needsPromotionSingletonObservable = new SingletonObservable(undefined, needsPromotionObservable);

export const usePendingUser: () => FirePendingUser | undefined =
    createUseSingletonObservableHook(needsPromotionSingletonObservable);


/**
 * Queries pending users based on course ID.
 * @param {string} courseId - Course ID to query pending users
 * @returns {readonly FirePendingUser[]} - Returns an array of pending users
 */
const pendingUsersQuery = (courseId: string) => 
    query(collection(firestore, 'pendingUsers'), where(`roles.${courseId}`, 'in', ['professor', 'ta']));

export const usePendingUsers = (courseId: string): readonly FirePendingUser[] => {
    const pendingUsers = useQuery<FirePendingUser>(courseId, pendingUsersQuery, 'userId');
    return pendingUsers;
};

/**
 * Queries admin status based on user email.
 * @returns {boolean} - Returns true if the user is an admin
 */
const isAdminObservable = loggedIn$.pipe(
    switchMap(user => {
        const adminRef = getDocumentReference(firestore, 'admins', user.email);
        return docData(adminRef) as Observable<unknown>; // Should adjust according to actual admin check logic
    })
);

export const isAdminSingletonObservable = new SingletonObservable(false, isAdminObservable);

export const useIsAdmin = createUseSingletonObservableHook(isAdminSingletonObservable);

/**
 * Queries all courses from Firestore.
 * @returns {readonly FireCourse[]} - Returns an array of all courses
 */
const allCoursesObservable: Observable<readonly FireCourse[]> = collectionData(
    query(collection(firestore, 'courses')), 'courseId'
);

const allCoursesSingletonObservable = new SingletonObservable([], allCoursesObservable);

export const useAllCourses: () => readonly FireCourse[] = 
    createUseSingletonObservableHook(allCoursesSingletonObservable);

/**
 * Uses user info to filter courses where the user is enrolled.
 * @returns {readonly FireCourse[]} - Returns an array of courses where the user is enrolled
 */
export const useMyCourses = (): readonly FireCourse[] => {
    const allCourses = useAllCourses();
    const user = useMyUser();
    if (!user) return [];
    const currentlyEnrolledCourseIds = new Set(user.courses);
    return allCourses.filter(course => currentlyEnrolledCourseIds.has(course.courseId));
};

/**
 * Queries for user tags within a course.
 * @param {string} courseId - Course ID to query tags
 * @returns {{ readonly [tagId: string]: FireTag }} - Returns an object map of tags
 */
const courseTagQuery = (courseId: string) => 
    query(collection(firestore, 'tags'), where('courseId', '==', courseId));

export const useCourseTags = (courseId: string): { readonly [tagId: string]: FireTag } => {
    const tagsList = useQuery<FireTag>(courseId, courseTagQuery, 'tagId');
    const tags: { [tagId: string]: FireTag } = {};
    tagsList.forEach(tag => {
        tags[tag.tagId] = tag;
    });

    return tags;
};

const courseUserQuery = (courseId: string) => 
    query(collection(firestore, 'users'), where('courses', 'array-contains', courseId));

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

    return blocks.map(block => query(collection(firestore, 'users'), where(
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

const getSessionQuestionsQuery = (sessionId: string) => query(collection(firestore, 'questions'),
    where('sessionId', '==', sessionId),
    orderBy('timeEntered', 'asc'));
const getSessionQuestionSlotsQuery = (sessionId: string) => query(collection(firestore, 'questionSlots'),
    where('sessionId', '==', sessionId),
    orderBy('timeEntered', 'asc'));
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
        collectionData<BlogPost>(query(collection(firestore, 'blogPosts'), orderBy("timeEntered", "desc")), 'postId'))
);

const allBlogPostsSingletonObservable = new SingletonObservable([], allBlogPostsObservable);

export const useAllBlogPosts: () => readonly BlogPost[] =
    createUseSingletonObservableHook(allBlogPostsSingletonObservable);

export const useParameterizedComments: (questionId: string) => readonly FireComment[] =
    createUseParamaterizedSingletonObservableHook(questionId => {
        const commentsQuery = collection(firestore, `questions/${questionId}/comments`);
        return new SingletonObservable([], collectionData<FireComment>(commentsQuery, 'commentId'));
    });

export const useProductUpdate = (): BlogPost | undefined => useAllBlogPosts()[0]

export const useNotificationTracker =
    (trackerId: string | undefined): NotificationTracker | undefined =>
        useDoc<NotificationTracker>('notificationTrackers', trackerId, 'trackerId')

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

export const getTagsQuery = (courseId: string) => 
    query(collection(firestore, 'tags'), where('courseId', '==', courseId));

export const getQuestionsQuery = (courseId: string) => 
    query(collection(firestore, 'questions'), where('courseId', '==', courseId));