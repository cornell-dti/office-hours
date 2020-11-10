import collections from '../collections';

export const updateCourses = async (user: FireUser, courses: string[]) => {
    const userUpdate: Partial<FireUser> = { courses: [...courses] };

    return collections.users().doc(user.userId).update(userUpdate);
};