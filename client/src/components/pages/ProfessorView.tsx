import * as React from 'react';
import ProfessorCalendarTable from '../includes/ProfessorCalendarTable';
import ProfessorAddNewOH from '../includes/ProfessorAddNewOH';
import ProfessorHeader from '../includes/ProfessorHeader';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

const QUERY = gql`
query FindSessionsByCourse($courseId: Int!) {
    courseByCourseId(courseId: $courseId) {
        tas: courseUsersByCourseId(condition: {role: "ta"}) {
            nodes {
                userByUserId {
                firstName
                lastName
                }
            }
        }
        professors: courseUsersByCourseId(condition: {role: "professor"}) {
            nodes {
                userByUserId {
                firstName
                lastName
                }
            }
        }
    }
}
`;

const withData = graphql<Response, InputProps>(
    QUERY, {
        options: ({ courseId }) => ({
            variables: {
                courseId: 1
            }
        })
    }
);

type InputProps = {
    courseId: number
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

class ProfessorView extends React.Component<ChildProps<InputProps, Response>> {
    // props: {
    //     match: {
    //         params: {
    //             courseId: number
    //         }
    //     }
    // };

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
        var taList: string[] = [];

        if (this.props.data.courseByCourseId) {
            this.props.data.courseByCourseId.tas.nodes.forEach((node: TANode) => {
                taList.push(node.userByUserId.firstName + " " + node.userByUserId.lastName);
            });
            this.props.data.courseByCourseId.professors.nodes.forEach((node: TANode) => {
                taList.push(node.userByUserId.firstName + " " + node.userByUserId.lastName);
            });
        }

        return (
            <div className="ProfessorView">
                <ProfessorSidebar
                    course="CS 1380"
                    selected={2}
                />
                <div className="rightOfSidebar">
                    <ProfessorHeader
                        professor="Michael Clarkson"
                        image="https://www.cs.cornell.edu/~clarkson/img/mrc_gates300.jpg"
                        notification={true}
                    />
                    <div className="main">
                        <ProfessorAddNewOH
                            taList={taList}
                        />
                        <CalendarWeekSelect
                            handleClick={this.handleWeekClick}
                        />
                        <div className="Calendar">
                            <ProfessorCalendarTable
                                // courseId={this.props.match.params.courseId}
                                courseId={1}
                                beginTime={new Date(this.state.selectedWeekEpoch)}
                                endTime={new Date(this.state.selectedWeekEpoch +
                                    7 /* days */ * 24 /* hours */ * 60 /* minutes */
                                    * 60 /* seconds */ * 1000 /* millis */)}
                                data={{}}
                                taList={taList}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withData(ProfessorView);
