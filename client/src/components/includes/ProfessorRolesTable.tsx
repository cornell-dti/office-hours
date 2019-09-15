import React, { useState } from 'react';
import { Dropdown, Table } from 'semantic-ui-react';
import _ from 'lodash';

const RoleDropdown = (props: {
    default: string;
    userId: number;
    courseId: string;
}) => {
    const [value, setValue] = useState<string | undefined>(props.default);

    return (
        <Dropdown
            loading={false}
            error={false}
            text={value}
            options={[
                { key: 1, text: 'Student', value: 'student' },
                { key: 2, text: 'TA', value: 'ta' },
                { key: 3, text: 'Professor', value: 'professor' },
            ]}
            // @ts-ignore I don't have time to deal with this now
            onChange={(e, v: { value: string }) => setValue(v.value)}
        />
    );
};

const ProfessorRolesTable = (props: {
    courseId: string;
    data: [{
        role: string;
        userByUserId: FireUser;
    }];
}) => {
    const [column, setColumn] = useState('');
    const [direction, setDirection] = useState<'ascending' | 'descending' | undefined>('ascending');

    const handleSort = (clickedColumn: string) => () => {
        if (column !== clickedColumn) {
            // data: _.sortBy(data, [clickedColumn]),
            setDirection('ascending');
            setColumn(clickedColumn);
            return;
        }
        setDirection(direction === 'ascending' ? 'descending' : 'ascending');
        // data: data.reverse()
    };

    return (
        <Table sortable celled fixed className="rolesTable">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell
                        sorted={column === 'firstname' ? direction : undefined}
                        onClick={handleSort('firstname')}
                    >
                        First Name
                    </Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={column === 'lastname' ? direction : undefined}
                        onClick={handleSort('lastname')}
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
                {/* {data.map(i => (
                    <Table.Row key={i.userId}>
                        <Table.Cell>{i.firstname}</Table.Cell>
                        <Table.Cell>{i.lastname}</Table.Cell>
                        <Table.Cell>{i.email}</Table.Cell>
                        <Table.Cell textAlign="right" className="dropdownCell">
                            <RoleDropdown
                                default={i.role}
                                userId={i.userId}
                                courseId={props.courseId}
                            />
                        </Table.Cell>
                    </Table.Row>
                ))} */}
            </Table.Body>
        </Table>
    );
};

export default ProfessorRolesTable;
