import * as React from 'react';
import { useState, useEffect } from 'react';
import { Dropdown, Table } from 'semantic-ui-react';
import * as _ from 'lodash';

import { firestore } from '../../firebase';
import { switchMap, map } from 'rxjs/operators';
import { docData, collection } from 'rxfire/firestore';
// Importing combineLatest from rxjs/operators broke everything...
import { combineLatest } from 'rxjs';
import { useCourse } from '../../firehooks';

const addTa = async (
    courseId: string,
    existingCourseUsers: enrichedFireCourseUser[],
    taEmailList: readonly string[]
): Promise<void> => {
    const taUserDocuments = await firestore.collection('users').where('email', 'in', taEmailList).get();
    const missingSet = new Set(taEmailList);
    const exsitingCourseUserEmailToCourseUserId = new Map<string, string>();
    existingCourseUsers.forEach(
        ({ email, courseUserId }) => exsitingCourseUserEmailToCourseUserId.set(email, courseUserId)
    );
    const batch = firestore.batch();
    const addedEmails: string[] = [];
    const updatedEmails: string[] = [];
    taUserDocuments.forEach(document => {
        const userId = document.id;
        const { email } = document.data() as FireUser;
        const existingCourseUserId = exsitingCourseUserEmailToCourseUserId.get(email);
        if (existingCourseUserId != null) {
            batch.set(firestore.collection('courseUsers').doc(existingCourseUserId), { role: 'ta', courseId, userId });
            updatedEmails.push(email);
        } else {
            batch.set(firestore.collection('courseUsers').doc(), { role: 'ta', courseId, userId });
            addedEmails.push(email);
        }
        missingSet.delete(email);
    });
    await batch.commit();
    const message = 'Successfully\n'
        + `added: [${addedEmails.join(', ')}];\n`
        + `updated: [${updatedEmails.join(', ')}];\n`
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

const RoleDropdown = ({ default: role, courseUserId, userId, course }: {
    default: string;
    courseUserId: string;
    userId: string;
    course: FireCourse;
}) => {
    return (
        <Dropdown
            text={role}
            options={[
                { key: 1, text: 'Student', value: 'student' },
                { key: 2, text: 'TA', value: 'ta' },
                { key: 3, text: 'Professor', value: 'professor' },
            ]}
            onChange={(e, newValue) => {
                const newRole = newValue.value as FireCourseRole;
                const courseUserUpdate: Omit<FireCourseUser, 'courseUserId'> = {
                    role: newRole,
                    courseId: course.courseId,
                    userId,
                };
                const batch = firestore.batch();
                batch.update(firestore.collection('courseUsers').doc(courseUserId), courseUserUpdate);
                const courseUpdate: Partial<FireCourse> = {
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
                };
                batch.update(firestore.collection('courses').doc(course.courseId), courseUpdate);
                batch.commit();
            }}
        />
    );
};

type columnT = 'firstName' | 'lastName' | 'email' | 'role';

type enrichedFireCourseUser = FireUser & { role: FireCourseRole; courseUserId: string };

export default ({ courseId }: { courseId: string }) => {
    const [direction, setDirection] = useState<'descending' | 'ascending'>('ascending');
    const [column, setColumn] = useState<columnT>('email');
    const [data, setData] = useState<enrichedFireCourseUser[]>([]);
    const course = useCourse(courseId);

    // Fetch data for the table
    // First, get user id's for all enrolled by querying CourseUsers
    // Next, map each course user to that user object
    // Add the role from the courseUser to the User so we can display data
    useEffect(
        () => {
            const courseUsers$ = collection(
                firestore
                    .collection('courseUsers')
                    .where('courseId', '==', courseId)
            );

            const users$ = courseUsers$.pipe(switchMap(courseUsers =>
                combineLatest(...courseUsers.map(courseUserDocument => {
                    const courseUserId = courseUserDocument.id;
                    const { userId, role } = courseUserDocument.data() as FireCourseUser;
                    return docData<FireUser>(firestore.doc(`users/${userId}`), 'userId').pipe(
                        map(u => ({ ...u, role, courseUserId }))
                    );
                }))
            ));

            const subscription = users$.subscribe(u => setData(u));
            return () => subscription.unsubscribe();
        },
        [courseId]
    );

    const importTAButtonOnClick = (): void => {
        const response = prompt('Please enter a comma-separated list of TA emails:');
        if (response == null) {
            return;
        }
        addTa(courseId, data, response.split(',').map(email => email.trim()));
    };

    const handleSort = (clickedColumn: columnT) => () => {
        if (column !== clickedColumn) {
            setDirection('ascending');
            setColumn(clickedColumn);
            setData(_.sortBy(data, [clickedColumn]));
        } else {
            setDirection(direction === 'ascending' ? 'descending' : 'ascending');
            setData(data.reverse());
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
                {course && data.map(u => (
                    <Table.Row key={u.userId}>
                        <Table.Cell>{u.firstName}</Table.Cell>
                        <Table.Cell>{u.lastName}</Table.Cell>
                        <Table.Cell>{u.email}</Table.Cell>
                        <Table.Cell textAlign="right" className="dropdownCell">
                            <RoleDropdown
                                default={u.role}
                                courseUserId={u.courseUserId}
                                userId={u.userId}
                                course={course}
                            />
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
};
