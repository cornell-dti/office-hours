import * as React from 'react';
import { useState } from 'react';
import { Dropdown, Table } from 'semantic-ui-react';
import * as _ from 'lodash';

import { firestore } from '../../firebase';
import { useCourse, useUsersInCourse } from '../../firehooks';

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
    professors: addOrRemoveFromRoleIdList(
        newRole === 'professor',
        course.professors,
        userId
    ),
    tas: addOrRemoveFromRoleIdList(
        newRole === 'ta',
        course.tas,
        userId
    )
});

const getCourseRoleUpdates = (
    course: FireCourse,
    userRoleUpdates: readonly (readonly [string, FireCourseRole])[]
): Partial<FireCourse> => {
    const professors = userRoleUpdates.reduce(
        (previousProfessors, [userId, newRole]) => (
            addOrRemoveFromRoleIdList(newRole === 'professor', previousProfessors, userId)
        ),
        course.professors
    );
    const tas = userRoleUpdates.reduce(
        (previousTAs, [userId, newRole]) => (
            addOrRemoveFromRoleIdList(newRole === 'ta', previousTAs, userId)
        ),
        course.tas
    );
    return { professors, tas };
};

const addTa = async (
    course: FireCourse,
    taEmailList: readonly string[]
): Promise<void> => {
    const taUserDocuments = await firestore.collection('users').where('email', 'in', taEmailList).get();
    const missingSet = new Set(taEmailList);
    const batch = firestore.batch();
    const updatedUsers: FireUser[] = [];
    taUserDocuments.forEach(document => {
        const existingUser = { userId: document.id, ...document.data() } as FireUser;
        const { email } = existingUser;
        const roleUpdate = getUserRoleUpdate(existingUser, course.courseId, 'ta');
        batch.update(firestore.collection('users').doc(existingUser.userId), roleUpdate);
        updatedUsers.push(existingUser);
        missingSet.delete(email);
    });
    batch.update(
        firestore.collection('courses').doc(course.courseId),
        getCourseRoleUpdates(course, updatedUsers.map(user => [user.userId, 'ta'] as const))
    );
    await batch.commit();
    const message = 'Successfully\n'
        + `updated: [${updatedUsers.map(user => user.email).join(', ')}];\n`
        + `[${Array.from(missingSet).join(', ')}] do not exist in our system yet.`;
    alert(message);
};

const addOrRemoveFromRoleIdList = (
    isAdd: boolean,
    roleIdList: readonly string[],
    userId: string
): readonly string[] => {
    if (isAdd) {
        return roleIdList.includes(userId) ? roleIdList : [...roleIdList, userId];
    } else {
        return roleIdList.filter(id => id !== userId);
    }
};

const RoleDropdown = ({ user, course }: {
    readonly user: EnrichedFireUser;
    readonly course: FireCourse;
}) => {
    return (
        <Dropdown
            text={user.role}
            options={[
                { key: 1, text: 'Student', value: 'student' },
                { key: 2, text: 'TA', value: 'ta' },
                { key: 3, text: 'Professor', value: 'professor' },
            ]}
            onChange={(e, newValue) => {
                const newRole = newValue.value as FireCourseRole;
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
            }}
        />
    );
};

type columnT = 'firstName' | 'lastName' | 'email' | 'role';

type EnrichedFireUser = FireUser & { role: FireCourseRole };

export default ({ courseId }: { courseId: string }) => {
    const [direction, setDirection] = useState<'descending' | 'ascending'>('ascending');
    const [column, setColumn] = useState<columnT>('email');
    const course = useCourse(courseId);

    const courseUsers: readonly EnrichedFireUser[] = useUsersInCourse(courseId)
        .map(user => ({ ...user, role: user.roles[courseId] || 'student' }));

    const sortedCourseUsers: readonly EnrichedFireUser[] = (() => {
        const sorted = _.sortBy(courseUsers, [column]);
        return direction === 'ascending' ? sorted : sorted.reverse();
    })();

    const importTAButtonOnClick = (): void => {
        const response = prompt('Please enter a comma-separated list of TA emails:');
        if (response == null || course == null) {
            return;
        }
        addTa(course, response.split(',').map(email => email.trim()));
    };

    const handleSort = (clickedColumn: columnT) => () => {
        if (column !== clickedColumn) {
            setDirection('ascending');
            setColumn(clickedColumn);
        } else {
            setDirection(previousDirection => previousDirection === 'ascending' ? 'descending' : 'ascending');
        }
    };

    return (
        <Table sortable={true} celled={true} fixed={true} className="rolesTable">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell
                        sorted={column === 'firstName' ? direction : undefined}
                        onClick={handleSort('firstName')}
                    >
                        First Name
                    </Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={column === 'lastName' ? direction : undefined}
                        onClick={handleSort('lastName')}
                    >
                        Last Name
                    </Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={column === 'email' ? direction : undefined}
                        onClick={handleSort('email')}
                    >
                        Email
                    </Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={column === 'role' ? direction : undefined}
                        onClick={handleSort('role')}
                    >
                        Role
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                <Table.Row>
                    <Table.Cell>
                        <button onClick={importTAButtonOnClick}>Import TAs</button>
                    </Table.Cell>
                </Table.Row>
                {course && sortedCourseUsers.map(u => (
                    <Table.Row key={u.userId}>
                        <Table.Cell>{u.firstName}</Table.Cell>
                        <Table.Cell>{u.lastName}</Table.Cell>
                        <Table.Cell>{u.email}</Table.Cell>
                        <Table.Cell textAlign="right" className="dropdownCell">
                            <RoleDropdown user={u} course={course} />
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
};
