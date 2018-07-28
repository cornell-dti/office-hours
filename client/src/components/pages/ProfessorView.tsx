import * as React from 'react';
import ProfessorCalendarTable from '../includes/ProfessorCalendarTable';
import ProfessorAddNew from '../includes/ProfessorAddNew';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';
import ProfessorOHInfo from '../includes/ProfessorOHInfo';
import gql from 'graphql-tag';
import { graphql, ChildProps } from 'react-apollo';
import { DropdownItemProps } from 'semantic-ui-react';
import 'moment-timezone';

const QUERY = gql`
query FindSessionsByCourse($courseId: Int!) {
    courseByCourseId(courseId: $courseId) {
        tas: courseUsersByCourseId(condition: {role: "ta"}) {
            nodes {
                userByUserId {
                    firstName
                    lastName
                    userId
                }
            }
        }
        professors: courseUsersByCourseId(condition: {role: "professor"}) {
            nodes {
                userByUserId {
                    firstName
                    lastName
                    userId
                }
            }
        }
    }
}
`;

const withData = graphql<InputProps, Response>(
    QUERY, {
        options: ({ match }) => ({
            variables: {
                courseId: match.params.courseId
            }
        })
    }
);

type InputProps = {
    match: {
        params: {
            courseId: number
        }
    },
    data: {
        courseByCourseId?: {
            tas: {
                nodes: [{}]
            }
            professors: {
                nodes: [{}]
            }
        }
    }
};

class ProfessorView extends React.Component<ChildProps<InputProps, Response>>  {
    state: {
        selectedWeekEpoch: number
    };

    constructor(props: ChildProps<InputProps, Response>) {
        super(props);
        var week = new Date();
        week.setHours(0, 0, 0, 0);
        week.setDate(week.getDate() + 1 - week.getDay());
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        this.state = {
            selectedWeekEpoch: week.getTime()
        };
        this.handleWeekClick = this.handleWeekClick.bind(this);
    }

    handleWeekClick(previousWeek: boolean) {
        if (previousWeek) {
            this.setState({
                selectedWeekEpoch: this.state.selectedWeekEpoch -
                    7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */
            });
        } else {
            this.setState({
                selectedWeekEpoch: this.state.selectedWeekEpoch +
                    7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */
            });
        }
    }

    render() {
        const taOptions: DropdownItemProps[] = [];
        if (this.props.data.courseByCourseId) {
            this.props.data.courseByCourseId.tas.nodes.forEach((node: TANode) => {
                taOptions.push({
                    value: node.userByUserId.userId,
                    text: node.userByUserId.firstName + ' ' + node.userByUserId.lastName
                });
            });
            this.props.data.courseByCourseId.professors.nodes.forEach((node: TANode) => {
                taOptions.push({
                    value: node.userByUserId.userId,
                    text: node.userByUserId.firstName + ' ' + node.userByUserId.lastName
                });
            });
        }

        return (
            <div className="ProfessorView">
                <ProfessorSidebar
                    course="CS 1380"
                    selected={2}
                />
                <section className="rightOfSidebar">
                    <TopBar
                        user={{
                            computedName: 'Michael Clarkson',
                            computedAvatar: 'https://www.cs.cornell.edu/~clarkson/img/mrc_gates300.jpg',
                            userId: -1
                        }}
                    />
                    <div className="main">
                        <ProfessorAddNew
                            text="Add New Office Hour"
                            content={
                                <ProfessorOHInfo
                                    courseId={this.props.match.params.courseId}
                                    isNewOH={true}
                                    taOptions={taOptions}
                                />
                            }
                        />
                        <CalendarWeekSelect
                            handleClick={this.handleWeekClick}
                        />
                        <div className="Calendar">
                            <ProfessorCalendarTable
                                _courseId={this.props.match.params.courseId}
                                _beginTime={new Date(this.state.selectedWeekEpoch)}
                                _endTime={new Date(this.state.selectedWeekEpoch +
                                    7 /* days */ * 24 /* hours */ * 60 /* minutes */
                                    * 60 /* seconds */ * 1000 /* millis */)}
                                data={{ loading: true }}
                                key={this.state.selectedWeekEpoch}
                                taOptions={taOptions}
                            />
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default withData(ProfessorView);
