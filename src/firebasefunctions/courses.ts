import { doc, updateDoc, setDoc, deleteDoc, getDocs, where, collection, 
    query, writeBatch, arrayUnion } from 'firebase/firestore';
import { httpsCallable } from "firebase/functions";

import { firestore, functions } from '../firebase';

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
     * This function uses emailjs to send the course request emails with the correct template and template variables.
     * @param user: user to send the email to
     * @param template: string representing end of template id (currently, only valid values for template are 
     * "rejected" or "approved")
     */
const callSendEmailFunction = async (emailData: 
{template:"approved"|"rejected", course: FireCourse, user: FireUser}) => {
    try {
        const sendEmail = httpsCallable(functions, 'sendEmail');
        const result = await sendEmail(emailData);
        // eslint-disable-next-line no-console
        console.log('Email sent successfully:', result);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error calling sendEmail function: ', error);
    }
};


/**
 * This function removes a course from the pendingCourses collection
 * (i.e. rejects the request to add the course)
 * @param course: course to be removed from pendingCourses
 * @param user: user to send rejection email to
 * @requires course exists in pendingCourses
 */
export const rejectPendingCourse = (  
    course: FireCourse,
    user: FireUser
): Promise<void> => {
    callSendEmailFunction({template: "rejected", course, user});
    const courseId = course.courseId;
    return deleteDoc(doc(firestore, 'pendingCourses', courseId))
}

/**
 * This function removes a course from the pendingCourses collection and adds it to the courses collection
 * (i.e. accepts the request to add the course). It also updates the 'courses' and 'roles' fields for a user.
 * @param course: course to be removed from pendingCourses and added to courses
 * @param user: user to become a professor of the course
 * @requires course exists in pendingCourses and does not exist in courses
 */
export const confirmPendingCourse = (
    course: FireCourse,
    user: FireUser
): Promise<void> => {
    const courseId = course.courseId;
    callSendEmailFunction({template: "approved", course, user});

    const batch = writeBatch(firestore);
    batch.delete(doc(firestore, 'pendingCourses', courseId));
    batch.set(doc(firestore, 'courses', courseId), course);
    // Sets the user to be professor even if they are technically a TA) since a requrester
    // will likely want to create OH
    batch.update(doc(firestore,'users', user.userId), {
        courses: arrayUnion(courseId),
        [`roles.${courseId}`]: "professor"
    })
    return batch.commit();
}