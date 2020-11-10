import { firestore } from '../firebase';
import { getCourseRoleUpdate, getUserRoleUpdate } from '../firebasefunctions';

export const changeRole = (
    user: FireUser,
    course: FireCourse,
    newRole: FireCourseRole
): void => {
    const batch = firestore.batch();
    batch.update(
        firestore.collection('users').doc(user.userId),
        getUserRoleUpdate(user, course.courseId, newRole)
    );
    batch.update(
        firestore.collection('courses').doc(course.courseId),
        getCourseRoleUpdate(course, user.userId, newRole)
    );
    batch.commit();
};
