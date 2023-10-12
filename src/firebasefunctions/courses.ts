import firebase from "firebase/compat/app"

const firestore = firebase.firestore();

export const updateCourses = (
    userId: string,
    userUpdate: Partial<FireUser>
): Promise<void> => {
    return firestore.collection('users').doc(userId).update(userUpdate)
};

/**
 * This function adds the course to the pendingCourses collection if the courseId does not
 * already exist in the pendingCourses or courses collection. Otherwise, it throws an error.
 * @param courseId: courseId of the course to be added to pendingCourses
 * @param course: course to be added to pendingCourses
 */
export const addPendingCourse = async (
    courseId: string,
    course: FireCourse,
): Promise<void> => {
    if ((await firestore.collection('pendingCourses').where('courseId', '==', courseId).get()).empty
        && (await firestore.collection('courses').where('courseId', '==', courseId).get()).empty) {
        return firestore.collection('pendingCourses').doc(courseId).set(course);
    } else {
        throw new Error('courseId already exists in pendingCourses or courses');
    }
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