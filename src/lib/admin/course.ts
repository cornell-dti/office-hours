import moment from 'moment';

import firebase from 'firebase';

import collections from '../collections';

export const editCourse = (courseId: string, update: Partial<FireCourse>): Promise<void> => {
    return collections.courses().doc(courseId).update(update);
};

export interface CreateCourseOptions {
    code: string;
    endDate: moment.Moment;
    name: string;
    queueOpenInterval?: number;
    semester: string;
    startDate: moment.Moment;
    charLimit?: number;
    term: string;
    year: string;
}

export const createCourse = (courseId: string, options: CreateCourseOptions): Promise<void> => {
    const {
        name,
        code,
        semester,
        year,
        term,
        queueOpenInterval = 30,
        charLimit = 140,
        startDate,
        endDate,
    } = options;

    return collections.courses().doc(courseId).set({
        name,
        code,
        semester,
        year,
        term,
        queueOpenInterval,
        charLimit,
        startDate: firebase.firestore.Timestamp.fromDate(startDate.toDate()),
        endDate: firebase.firestore.Timestamp.fromDate(endDate.toDate()),
        tas: [],
        professors: []
    });
};