import * as Firebase from 'firebase-admin';

import { datePlus, normalizeDateToDateStart, normalizeDateToWeekStart } from '../utilities/date';
import { blockArray } from '../firehooks';

/* Basic Functions */


export class OHMutateError extends Error {
}

/* User Management Functions */

export const getUserRoleUpdate = (
    user: FireUser,
    courseId: string,
    role: FireCourseRole
): Partial<FireUser> => {
    const courses = [...user.courses];
    if (!courses.includes(courseId)) {
        courses.push(courseId);
    }
    const roles = { ...user.roles };
    if (role === 'student') {
        delete roles[courseId];
    } else {
        roles[courseId] = role;
    }
    return { courses, roles };
};

export const getCourseRoleUpdate = (
    course: FireCourse,
    userId: string,
    newRole: FireCourseRole
): Partial<FireCourse> => ({
    professors: addOrRemoveFromRoleIdList(newRole === 'professor', course.professors, userId),
    tas: addOrRemoveFromRoleIdList(newRole === 'ta', course.tas, userId),
});

export const getCourseRoleUpdates = (
    course: FireCourse,
    userRoleUpdates: readonly (readonly [string, FireCourseRole])[]
): Partial<FireCourse> => {
    const professors = userRoleUpdates.reduce(
        (previousProfessors, [userId, newRole]) =>
            addOrRemoveFromRoleIdList(newRole === 'professor', previousProfessors, userId),
        course.professors
    );
    const tas = userRoleUpdates.reduce(
        (previousTAs, [userId, newRole]) =>
            addOrRemoveFromRoleIdList(newRole === 'ta', previousTAs, userId),
        course.tas
    );
    return { professors, tas };
};

export const getWeekOffsets = (
    sessionSeries: Omit<FireSessionSeries, 'sessionSeriesId'>
): [number, number] => {
    const { startTime: seriesStartFireTimestamp, endTime: seriesEndFireTimestamp } = sessionSeries;
    const rawStart = seriesStartFireTimestamp.toDate();
    const rawEnd = seriesEndFireTimestamp.toDate();
    return [
        rawStart.getTime() - normalizeDateToWeekStart(rawStart).getTime(),
        rawEnd.getTime() - normalizeDateToWeekStart(rawEnd).getTime(),
    ];
};

export const addOrRemoveFromRoleIdList = (
    isAdd: boolean,
    roleIdList: readonly string[],
    userId: string
): readonly string[] => {
    if (isAdd) {
        return roleIdList.includes(userId) ? roleIdList : [...roleIdList, userId];
    }
    return roleIdList.filter((id) => id !== userId);
};


