import { firestore } from '../firebase';

export const updateCourses = (
    userId: string,
    userUpdate: Partial<FireUser>
): Promise<void> => {
    return firestore.collection('users').doc(userId).update(userUpdate)
};

/**
 * This function removes a course from the pendingCourses collection
 * (i.e. rejects the request to add the course)
 * @param courseId: courseId of the course to be removed from pendingCourses
 * @requires courseId exists in pendingCourses
 */
export const rejectPendingCourse = (  
    courseId: string,
): Promise<void> => {
    return firestore.collection('pendingCourses').doc(courseId).delete();
}

/**
 * This function removes a course from the pendingCourses collection and adds it to the courses collection
 * (i.e. accepts the request to add the course)
 * @param course: course to be removed from pendingCourses and added to courses
 * @requires course exists in pendingCourses and does not exist in courses
 */
export const confirmPendingCourse = (
    course: FireCourse,
): Promise<void> => {
    const courseId = course.courseId;

    const batch = firestore.batch();
    batch.delete(firestore.collection('pendingCourses').doc(courseId));
    batch.set(firestore.collection('courses').doc(courseId), course);
    return batch.commit();
}