import firebase from "firebase/compat/app"
import {Resend} from 'resend';
import 'dotenv/config'

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
     * This function uses emailjs to send the course request emails with the correct template and template variables.
     * @param user: user to send the email to
     * @param template: string representing end of template id (currently, only valid values for template are 
     * "rejected" or "approved")
     */
    const sendEmail = (course:FireCourse, user: FireUser, template: string) => {
        const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);
        const subject = template === "approved" ? `Queue Me In ${course.code} ${course.semester} Approved`: `Queue Me In ${course.code} ${course.semester} Rejected`
        /* eslint-disable max-len */
        const message =`Hello ${user.firstName + " " + user.lastName},
        ${template === "approved" ? 
            "Your new class request on QMI has been approved. " + course.code + " has been added to the current classes for " +course.semester + ".":
            "Your new class request on QMI has been rejected. "+ course.code + " for " + course.semester + " has been removed from the pending classes. Please email QMI directly for more info."}

        Best wishes,
        QMI`

          resend.emails.send({
            from: 'queuemein@cornelldti.org',
            to: [user.email],
            subject: subject,
            html: message,
          });

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
    sendEmail(course, user, "rejected");
    const courseId = course.courseId;
    return firestore.collection('pendingCourses').doc(courseId).delete();
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
    sendEmail(course, user, "approved");

    const batch = firestore.batch();
    batch.delete(firestore.collection('pendingCourses').doc(courseId));
    batch.set(firestore.collection('courses').doc(courseId), course);
    // Sets the user to be professor even if they are technically a TA) since a requrester
    // will likely want to create OH
    batch.update(firestore.doc(`users/${user.userId}`), {
        courses: firebase.firestore.FieldValue.arrayUnion(courseId),
        [`roles.${courseId}`]: "professor"
    })
    return batch.commit();
}