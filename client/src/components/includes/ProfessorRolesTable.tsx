import * as React from 'react';
import { Dropdown, Table } from 'semantic-ui-react';
import * as _ from 'lodash';

import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const UPDATE_ROLE = gql`
    mutation UpdateRole($_courseId: Int!, $_userId: Int!, $_role: String!) {
        apiUpdateCourseUserRole(input:{_courseId: $_courseId, _userId: $_userId, _role: $_role})
        {
            clientMutationId
        }
    }
`;

class RoleDropdown extends React.Component<{
    default: string;
    userId: number;
    courseId: number;
}> {
    state = {
        value: this.props.default
    };

    render() {
        return (
            <Mutation mutation={UPDATE_ROLE}>
                {(updateRole, { loading, error }) =>
                    <Dropdown
                        loading={loading}
                        error={error && true}
                        text={this.state.value}
                        options={[
                            { key: 1, text: 'Student', value: 'student' },
                            { key: 2, text: 'TA', value: 'ta' },
                            { key: 3, text: 'Professor', value: 'professor' },
                        ]}
                        onChange={(e, value) => {
                            this.setState({ value: value.value });
                            updateRole({
                                variables: {
                                    _courseId: this.props.courseId,
                                    _userId: this.props.userId,
                                    _role: value.value
                                }
                            });
                        }}
                    />}
            </Mutation>);
    }

}

export default class ProfessorRolesTable extends React.Component {
    props: {
        courseId: number,
        data: [{
            role: string;
            userByUserId: AppUser;
        }]
    };
    state = {
        column: '',
        data: this.props.data.map(u => {
            return {
                firstname: u.userByUserId.firstName,
                lastname: u.userByUserId.lastName,
                email: u.userByUserId.email,
                userId: u.userByUserId.userId,
                role: u.role,
            };
        }),
        direction: undefined,
    };

    handleSort = (clickedColumn: string) => () => {
        const { column, direction } = this.state;

        if (column !== clickedColumn) {
            this.setState({
                column: clickedColumn,
                data: _.sortBy(this.state.data, [clickedColumn]),
                direction: 'ascending',
            });

            return;
        }

        this.setState({
            direction: direction === 'ascending' ? 'descending' : 'ascending',
            data: this.state.data.reverse()
        });
    }

    render() {
        const { column, direction } = this.state;

        return (
            <Table sortable={true} celled={true} fixed={true} className="rolesTable">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell
                            sorted={column === 'firstname' ? direction : undefined}
                            onClick={this.handleSort('firstname')}
                        >
                            First Name
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={column === 'lastname' ? direction : undefined}
                            onClick={this.handleSort('lastname')}
                        >
                            Last Name
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={column === 'email' ? direction : undefined}
                            onClick={this.handleSort('email')}
                        >
                            Email
                        </Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={column === 'role' ? direction : undefined}
                            onClick={this.handleSort('role')}
                        >
                            Roll
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {this.state.data.map(i => (
                        <Table.Row key={i.userId}>
                            <Table.Cell>{i.firstname}</Table.Cell>
                            <Table.Cell>{i.lastname}</Table.Cell>
                            <Table.Cell>{i.email}</Table.Cell>
                            <Table.Cell textAlign="right" className="dropdownCell">
                                <RoleDropdown
                                    default={i.role}
                                    userId={i.userId}
                                    courseId={this.props.courseId}
                                />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        );
    }
}
