
import { getCourseRoleUpdates, getUserRoleUpdate } from 'lib/firebasefunctions';
import collections from '../collections';
import { blockArray } from '../../firehooks';
import { firestore as db } from '../firebase';

export const importProfessorsOrTAs = async (
    course: FireCourse,
    role: 'professor' | 'ta',
    emailListTotal: readonly string[]
): Promise<void> => {
    const missingSet = new Set(emailListTotal);
    const batch = db.batch();
    const updatedUsers: FireUser[] = [];

    const emailBlocks = blockArray(emailListTotal, 10);

    Promise.all(emailBlocks.map(emailList => {
        return collections.users().where('email', 'in', emailList).get().then(taUserDocuments => {
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
        });

    })).then(updatedBlocks => {
        const allUpdates: { user: FireUser; roleUpdate: Partial<FireUser> }[] = [];

        updatedBlocks.forEach(updateBlock => {
            updateBlock.forEach(({ user, roleUpdate }) => {
                const { email } = user;
                updatedUsers.push(user);
                missingSet.delete(email);
                allUpdates.push({ user, roleUpdate });
                // update user's roles table
                batch.update(db.collection('users').doc(user.userId), roleUpdate);
            })

        });
        // update course's ta/professor roles
        batch.update(
            db.collection('courses').doc(course.courseId),
            getCourseRoleUpdates(
                course,
                allUpdates.map(({ user }) => [user.userId, role] as const)
            )
        )


        batch.commit();
    }).then(() => {
        const message =
            'Successfully\n' +
            `updated: [${updatedUsers.map((user) => user.email).join(', ')}];\n` +
            `[${Array.from(missingSet).join(', ')}] do not exist in our system yet.`;
        // eslint-disable-next-line no-alert
        alert(message);
    });


};