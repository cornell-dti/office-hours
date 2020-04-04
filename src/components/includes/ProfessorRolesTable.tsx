import * as React from 'react';
import { useState } from 'react';
import { Dropdown, Table } from 'semantic-ui-react';
import * as _ from 'lodash';

import { firestore } from '../../firebase';
import { useCourse, useCourseUsers } from '../../firehooks';
import { importProfessorsOrTAsFromPrompt, changeRole } from '../../firebasefunctions';

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
            onChange={(e, newValue) => changeRole(firestore, user, course, newValue.value as FireCourseRole)}
        />
    );
};

type columnT = 'firstName' | 'lastName' | 'email' | 'role';

type EnrichedFireUser = FireUser & { role: FireCourseRole };

export default ({ courseId }: { courseId: string }) => {
    const [direction, setDirection] = useState<'descending' | 'ascending'>('ascending');
    const [column, setColumn] = useState<columnT>('email');
    const course = useCourse(courseId);

    const courseUsers: readonly EnrichedFireUser[] = useCourseUsers(courseId)
        .map(user => ({ ...user, role: user.roles[courseId] || 'student' }));

    const sortedCourseUsers: readonly EnrichedFireUser[] = (() => {
        const sorted = _.sortBy(courseUsers, [column]);
        return direction === 'ascending' ? sorted : sorted.reverse();
    })();

    const importTAButtonOnClick = (): void => {
        if (course != null) {
            importProfessorsOrTAsFromPrompt(firestore, course, 'ta');
        }
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
