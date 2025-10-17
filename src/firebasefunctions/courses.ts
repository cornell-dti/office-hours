import { doc, updateDoc, setDoc, deleteDoc, getDocs, where, collection, query, writeBatch } from 'firebase/firestore';
import { firestore } from '../firebase';

export const updateCourses = (
    userId: string,
    userUpdate: Partial<FireUser>
): Promise<void> => {
    const userRef = doc(firestore, 'users', userId);
    return updateDoc(userRef, userUpdate);
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
    if (((await getDocs(query(collection(firestore, 'pendingCourses'), where('courseId', '==', courseId)))).empty)
        && ((await getDocs(query(collection(firestore, 'courses'), where('courseId', '==', courseId)))).empty)) {
        const pendingRef = doc(firestore, 'pendingCourses', courseId);
        return setDoc(pendingRef, course);
    } 
    throw new Error('courseId already exists in pendingCourses or courses');
    
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
    return deleteDoc(doc(firestore, 'pendingCourses', courseId))
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

    const batch = writeBatch(firestore);
    batch.delete(doc(firestore, 'pendingCourses', courseId));
    batch.set(doc(firestore, 'courses', courseId), course);
    return batch.commit();
}