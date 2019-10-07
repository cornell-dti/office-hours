import { useState, useEffect } from 'react';

import { firestore } from './firebase';
import { docData } from 'rxfire/firestore';

export const useDoc = <T>(collection: string, id: string, idField: string) => {
    const [doc, setDoc] = useState<T | undefined>();
    useEffect(
        () => {
            const primaryTag$ = docData(firestore.doc(collection + '/' + id), idField);
            const subscription = primaryTag$.subscribe((d: T) => setDoc(d));
            return () => { subscription.unsubscribe(); };
        },
        [id]
    );
    return doc;
};

export const useCourseUser = (courseUserId: string) => useDoc<FireCourse>('courseUsers', courseUserId, 'courseUserId');
export const useCourse = (courseId: string) => useDoc<FireCourse>('courses', courseId, 'courseId');
export const useQuestion = (questionId: string) => useDoc<FireTag>('questions', questionId, 'questionId');
export const useSessionSeries = (sessionSeriesId: string) => useDoc<FireTag>('sessionSeries', sessionSeriesId, 'sessionSeriesId');
export const useSession = (sessionId: string) => useDoc<FireTag>('sessions', sessionId, 'sessionId');
export const useTag = (tagId: string) => useDoc<FireTag>('tags', tagId, 'tagId');
export const useUser = (userId: string) => useDoc<FireTag>('users', userId, 'userId');
