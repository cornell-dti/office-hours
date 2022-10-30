import React, {useState} from 'react'
import { Table } from 'semantic-ui-react';
import {connect} from 'react-redux'
import _ from 'lodash';
import { usePendingUsers } from '../../firehooks';

type columnT = 'email' | 'role';

type Props = {
    courseId: string; 
}

type EnrichedPendingUser = FirePendingUser & { role: FireCourseRole };

const ProfessorPendingTable = ({courseId}: Props) => {
    const [column, setColumn] = useState<columnT>('email');
    const [direction, setDirection] = useState<'descending' | 'ascending'>('ascending');
    const pendingUsers: readonly EnrichedPendingUser[] = usePendingUsers(courseId).map(user => ({
        ...user,
        role: user.roles[courseId] || 'student',
    }));
    const sortedPendingUsers: readonly FirePendingUser[] = (() => {
        const sorted = _.sortBy(pendingUsers, [column]);
        return direction === 'ascending' ? sorted : sorted.reverse();
    })();
  
    const handleSort = (clickedColumn: columnT) => () => {
        if (column !== clickedColumn) {
            setDirection('ascending');
            setColumn(clickedColumn);
        } else {
            setDirection(previousDirection =>
                previousDirection === 'ascending' ? 'descending' : 'ascending'
            );
        }
    };

    return (
        <div className="rolesTable">
            {sortedPendingUsers.length !== 0 &&
        <Table sortable={true} celled={true} fixed={true}>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell colspan='2'>Pending Account Creation</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Header>
                <Table.Row>
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
            {sortedPendingUsers.map(u => (
                <Table.Row key={u.email}>
                    <Table.Cell>{u.email}</Table.Cell>
                    <Table.Cell>{u.roles[courseId] === "ta" ? "TA" : "Professor"}</Table.Cell>
                </Table.Row>
            ))}
        </Table>}
        </div>
    )
}

export default connect(null, {})(ProfessorPendingTable);