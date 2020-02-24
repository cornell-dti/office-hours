import * as React from 'react';
import { useState, useEffect } from 'react';
import { Dropdown, Table } from 'semantic-ui-react';
import * as _ from 'lodash';

import { firestore } from '../../firebase';
import { switchMap, map } from 'rxjs/operators';
import { docData, collection } from 'rxfire/firestore';
// Importing combineLatest from rxjs/operators broke everything...
import { combineLatest } from 'rxjs';

const RoleDropdown = ({ default: role, courseUserId, userId, courseId }: {
    default: string;
    courseUserId: string;
    userId: string;
    courseId: string;
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
                const update = {
                    role: newValue.value,
                    courseId,
                    userId,
                };
                firestore.collection('courseUsers').doc(courseUserId).update(update);
            }}
        />
    );
};

type columnT = 'firstName' | 'lastName' | 'email' | 'role';

type enrichedFireCourseUser = FireUser & { role: FireCourseRole; courseUserId: string };

export default (props: { courseId: string }) => {
    const [direction, setDirection] = useState<'descending' | 'ascending'>('ascending');
    const [column, setColumn] = useState<columnT>('email');
    const [data, setData] = useState<enrichedFireCourseUser[]>([]);

    // Fetch data for the table
    // First, get user id's for all enrolled by querying CourseUsers
    // Next, map each course user to that user object
    // Add the role from the courseUser to the User so we can display data
    useEffect(
        () => {
            const courseUsers$ = collection(
                firestore
                    .collection('courseUsers')
                    .where('courseId', '==', props.courseId)
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
        [props.courseId]
    );

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
                {data.map(u => (
                    <Table.Row key={u.userId}>
                        <Table.Cell>{u.firstName}</Table.Cell>
                        <Table.Cell>{u.lastName}</Table.Cell>
                        <Table.Cell>{u.email}</Table.Cell>
                        <Table.Cell textAlign="right" className="dropdownCell">
                            <RoleDropdown
                                default={u.role}
                                courseUserId={u.courseUserId}
                                userId={u.userId}
                                courseId={props.courseId}
                            />
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
};
