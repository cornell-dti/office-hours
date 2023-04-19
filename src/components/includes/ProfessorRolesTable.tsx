import React, { useState } from 'react';
import { Dropdown, Table } from 'semantic-ui-react';
import * as _ from 'lodash';
import {connect} from 'react-redux'
import { useCourse, useCourseUsers } from '../../firehooks';
import { importProfessorsOrTAsFromPrompt, changeRole } from '../../firebasefunctions/importProfessorsOrTAs';
import { RootState } from '../../redux/store';

const RoleDropdown = ({
    user,
    course,
    disabled,
}: {
    readonly user: EnrichedFireUser;
    readonly course: FireCourse;
    readonly disabled?: boolean;
}) => {
    return (
        <Dropdown
            options={[
                { key: 1, text: 'Student', value: 'student' },
                { key: 2, text: 'TA', value: 'ta' },
                { key: 3, text: 'Professor', value: 'professor' },
            ]}
            disabled={disabled}
            defaultValue={user.role}
            onChange={(e, newValue) => {
                const newValueRole = newValue.value as FireCourseRole;

                // prevents profs from unintentionally demoting other users
                if (user.role !== undefined && newValueRole !== user.role) {
                    changeRole(user, course, newValueRole);
                }
            }}
        />
    );
};

RoleDropdown.defaultProps = {
    disabled: false,
};

type columnT = 'firstName' | 'lastName' | 'email' | 'role';

type EnrichedFireUser = FireUser & { role: FireCourseRole };

const mapStateToProps = (state: RootState) => ({
    user : state.auth.user
})

type Props = {
    user: FireUser | undefined; courseId: string; isAdminView: boolean; 
}

export default connect(mapStateToProps, {})(({ user, courseId, isAdminView }: Props) => {
    const [direction, setDirection] = useState<'descending' | 'ascending'>('ascending');
    const [column, setColumn] = useState<columnT>('email');
    const course = useCourse(courseId);

    const courseUsers: readonly EnrichedFireUser[] = useCourseUsers(courseId).map(user => ({
        ...user,
        role: user.roles[courseId] || 'student',
    }));

    const sortedCourseUsers: readonly EnrichedFireUser[] = (() => {
        const sorted = _.sortBy(courseUsers, [column]);
        return direction === 'ascending' ? sorted : sorted.reverse();
    })();

    const importProfessorsButtonOnClick = (): void => {
        if (course != null) {
            importProfessorsOrTAsFromPrompt(course, 'professor');
        }
    };

    const importTAButtonOnClick = (): void => {
        if (course != null) {
            importProfessorsOrTAsFromPrompt(course, 'ta');
        }
    };

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

    const importButton = () => {
        return (
            <div className="import-buttons">
                <button type="button" onClick={importProfessorsButtonOnClick}>
                    Import Professors
                </button>
                <button type="button" onClick={importTAButtonOnClick}>
                    Import TAs
                </button>
            </div>
        );
    };

    return (
        <div className="rolesTable">
            {isAdminView && importButton()}
            <Table sortable={true} celled={true} fixed={true}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell colspan='4'>Active Roles</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
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
                    {course &&
                        sortedCourseUsers.map(u => (
                            <Table.Row key={u.userId}>
                                <Table.Cell>{u.firstName}</Table.Cell>
                                <Table.Cell>{u.lastName}</Table.Cell>
                                <Table.Cell>{u.email}</Table.Cell>
                                <Table.Cell textAlign="right" className="dropdownCell">
                                    <RoleDropdown
                                        user={u}
                                        course={course}
                                        disabled={isAdminView ? false : (u.email === user?.email)}
                                    />
                                </Table.Cell>
                            </Table.Row>
                        ))}
                </Table.Body>
            </Table>
        </div>
    );
});
