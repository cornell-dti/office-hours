import { doc, getDoc, getDocs, setDoc, updateDoc, query, where, collection, writeBatch } from 'firebase/firestore';
import { firestore } from '../firebase';
import { blockArray } from '../firehooks';

const db = firestore;

const getUserRoleUpdate = (
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

const getCourseRoleUpdate = (
    course: FireCourse,
    userId: string,
    newRole: FireCourseRole
): Partial<FireCourse> => ({
    professors: addOrRemoveFromRoleIdList(newRole === 'professor', course.professors, userId),
    tas: addOrRemoveFromRoleIdList(newRole === 'ta', course.tas, userId),
});

const getCourseRoleUpdates = (
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

const importProfessorsOrTAs = async (
    course: FireCourse,
    role: 'professor' | 'ta',
    emailListTotal: readonly string[]
): Promise<{
    updatedUsers: FireUser[]; courseChange: FireCourse; missingSet: Set<string>;
    demotedSet: Set<string>;
}> => {
    const missingSet = new Set<string>(emailListTotal);
    const demotedSet = new Set<string>();
    const batch = writeBatch(db);
    const updatedUsers: FireUser[] = [];
    const courseChange: FireCourse = { ...course };

    const emailBlocks = blockArray(emailListTotal, 10);

    return Promise.all(emailBlocks.map(async (emailList) => {
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('email', 'in', emailList));
        const taUserDocuments = await getDocs(userQuery); 
        // const updatedUsersThisBlock: FireUser[] = [];
        // const userUpdatesThisBlock: Partial<FireUser>[] = [];
        const updatesThisBlock: { user: FireUser; roleUpdate: Partial<FireUser> }[] = [];

        taUserDocuments.forEach((document) => {
            const existingUser = { userId: document.id, ...document.data() } as FireUser;
            const roleUpdate = getUserRoleUpdate(existingUser, course.courseId, role);
            updatesThisBlock.push({
                user: existingUser,
                roleUpdate
            })
        });

        return updatesThisBlock;

    })).then(updatedBlocks => {
        const allUpdates: { user: FireUser; roleUpdate: Partial<FireUser> }[] = [];

        updatedBlocks.forEach(updateBlock => {
            updateBlock.forEach(({ user, roleUpdate }) => {
                const { email } = user;
                missingSet.delete(email);
                if (user.roles[course.courseId] !== 'professor') {
                    updatedUsers.push(user);
                    allUpdates.push({ user, roleUpdate });
                    // update user's roles table
                    batch.update(doc(db, 'users', user.userId), roleUpdate);
                } else if (role !== 'professor') {
                    demotedSet.add(email);
                }

            })

        });

        // add missing user to pendingUsers collection
        missingSet.forEach(email => {
            const pendingUsersRef = doc(db, 'pendingUsers', email);
            getDoc(pendingUsersRef)
                .then((docSnapshot) => {
                    if (docSnapshot.exists()) {
                        updateDoc(pendingUsersRef, { [`roles.${course.courseId}`]: role });
                    } else {
                        setDoc(pendingUsersRef, { email, roles: { [course.courseId]: role } } );
                    }
                });
        })
        // update course's ta/professor roles
        const updates = getCourseRoleUpdates(
            course,
            allUpdates.map(({ user }) => [user.userId, role] as const)
        );
        if (updates.professors) courseChange.professors = updates.professors;
        if (updates.tas) courseChange.tas = updates.tas;
        batch.update(doc(db, 'courses', course.courseId),
            updates
        );
        batch.commit();
    }).then(() => {
        return { updatedUsers, courseChange, missingSet, demotedSet };
    });

};

/**
 * This function returns an updated role ID list to reflect the addition or
 * removal of a user ID.
 * @param isAdd: adds the user to the role ID list if true, removes the user if false
 * @param roleIdList: the role ID list before the add or remove
 * @param userId: the user ID to add or remove from the list
 */
const addOrRemoveFromRoleIdList = (
    isAdd: boolean,
    roleIdList: readonly string[],
    userId: string
): readonly string[] => {
    if (isAdd) {
        return roleIdList.includes(userId) ? roleIdList : [...roleIdList, userId];
    }
    return roleIdList.filter((id) => id !== userId);
};

export const changeRole = (
    user: FireUser,
    course: FireCourse,
    newRole: FireCourseRole
): void => {
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', user.userId),
        getUserRoleUpdate(user, course.courseId, newRole)
    );
    batch.update(doc(db, 'courses', course.courseId),
        getCourseRoleUpdate(course, user.userId, newRole)
    );
    batch.commit();
};

export const importProfessorsOrTAsFromPrompt = (
    course: FireCourse,
    role: 'professor' | 'ta'
): void => {
    // eslint-disable-next-line no-alert
    const response = prompt(
        `Please enter a comma-separated list of ${role === 'professor' ? role : 'TA'} emails:`
    );
    if (response != null) {
        importProfessorsOrTAs(
            course,
            role,
            response.split(',').map((email) => email.trim())
        );
    }
};

export const importProfessorsOrTAsFromCSV = (
    course: FireCourse,
    role: 'professor' | 'ta',
    emailList: string[]
): Promise<{
    updatedUsers: FireUser[]; courseChange: FireCourse;
    missingSet: Set<string>; demotedSet: Set<string>;
}> | undefined => {
    return importProfessorsOrTAs(
        course,
        role,
        emailList
    );
};