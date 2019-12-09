import * as React from 'react';
import { useState, useEffect } from 'react';
import { Dropdown, Table } from 'semantic-ui-react';
import * as _ from 'lodash';

import { firestore, collectionData } from 'src/firebase';
import { switchMap, map } from 'rxjs/operators';
import { docData } from 'rxfire/firestore';
import { Observable } from 'rxjs/internal/Observable';
// Importing combineLatest from rxjs/operators broke everything...
import { combineLatest } from 'rxjs';
import { useMyCourseUserWithId } from 'src/firehooks';

const RoleDropdown = (props: {
    default: string;
    userId: string;
    courseId: string;
}) => {
    const [value, setValue] = useState(props.default);
    const courseUser = useMyCourseUserWithId(props.courseId, props.userId);
    return (
        <Dropdown
            // RYAN_TODO loading and error state
            // loading={loading}
            // error={error && true}
            text={value}
            options={[
                { key: 1, text: 'Student', value: 'student' },
                { key: 2, text: 'TA', value: 'ta' },
                { key: 3, text: 'Professor', value: 'professor' },
            ]}
            onChange={(e, newValue) => {
                // @ts-ignore All values are strings
                setValue(newValue.value);
                if (courseUser !== undefined) {
                    const courseUserDoc = firestore.collection('courseUsers').doc(courseUser!.courseUserId);
                    courseUserDoc.update({
                        role: newValue.value
                    });
                }
            }}
        />
    );
};

type columnT = 'firstName' | 'lastName' | 'email' | 'role';

type enrichedFireUser = FireUser & { role: FireCouseRole };

export default (props: { courseId: string }) => {
    const [direction, setDirection] = useState<'descending' | 'ascending'>('ascending');
    const [column, setColumn] = useState<columnT>('email');
    const [data, setData] = useState<enrichedFireUser[]>([]);

    // Fetch data for the table
    // First, get user id's for all enrolled by querying CourseUsers
    // Next, map each course user to that user object
    // Add the role from the courseUser to the User so we can display data
    useEffect(
        () => {
            const courseUsers$: Observable<FireCourseUser[]> = collectionData(
                firestore
                    .collection('courseUsers')
                    .where('courseId', '==', firestore.doc('courses/' + props.courseId)),
                'courseUserId'
            );

            const users$ = courseUsers$.pipe(switchMap(courseUsers =>
                combineLatest(...courseUsers.map(courseUser =>
                    docData<FireUser>(firestore.doc(courseUser.userId.path), 'userId').pipe(
                        map(u => ({ ...u, role: courseUser.role }))
                    )
                ))
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
