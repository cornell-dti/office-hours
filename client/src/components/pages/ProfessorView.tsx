import * as React from 'react';
import ProfessorCalendarTable from '../includes/ProfessorCalendarTable';
import ProfessorAddNew from '../includes/ProfessorAddNew';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';
import gql from 'graphql-tag';
import { graphql, ChildProps } from 'react-apollo';
import { DropdownItemProps } from 'semantic-ui-react';
import 'moment-timezone';

const QUERY = gql`
query FindSessionsByCourse($courseId: Int!) {
    apiGetCurrentUser {
        nodes {
            computedName
            computedAvatar
        }
    }
    courseByCourseId(courseId: $courseId) {
        tas: courseUsersByCourseId(condition: {role: "ta"}) {
            nodes {
                userByUserId {
                    computedName
                    userId
                }
            }
        }
        professors: courseUsersByCourseId(condition: {role: "professor"}) {
            nodes {
                userByUserId {
                    computedName
                    userId
                }
            }
        }
        sessionsByCourseId {
            nodes {
                sessionSeriesId
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
        loading: boolean
        apiGetCurrentUser: {
            nodes: [AppUserRole]
        };
        courseByCourseId?: {
            tas: {
                nodes: [AppTa]
            }
            professors: {
                nodes: [AppTa]
            }
            sessionsByCourseId: {
                nodes: [AppSession]
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
        var taOptions: DropdownItemProps[] = [];
        var countMaxOH: number[] = [];

        if (this.props.data.courseByCourseId) {
            this.props.data.courseByCourseId.tas.nodes.forEach((node) => {
                taOptions.push({
                    value: node.userByUserId.userId,
                    text: node.userByUserId.computedName
                });
            });
            this.props.data.courseByCourseId.professors.nodes.forEach((node) => {
                taOptions.push({
                    value: node.userByUserId.userId,
                    text: node.userByUserId.computedName
                });
            });
            this.props.data.courseByCourseId.sessionsByCourseId.nodes.forEach((node) => {
                if (countMaxOH.indexOf(node.sessionSeriesId) === -1 || node.sessionSeriesId === null) {
                    countMaxOH.push(node.sessionSeriesId);
                }
            });
        }

        const { loading } = this.props.data;

        return (
            <div className="ProfessorView">
                <ProfessorSidebar
                    course="CS 1380"
                    selected={2}
                />
                {!loading && // Probably another way to do this
                    <section className="rightOfSidebar">
                        <TopBar
                            user={this.props.data.apiGetCurrentUser.nodes[0]}
                        />
                        <div className="main">
                            <ProfessorAddNew
                                courseId={this.props.match.params.courseId}
                                taOptions={taOptions}
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
                                    numMaxOH={countMaxOH.length}
                                />
                            </div>
                        </div>
                    </section>
                }
            </div>
        );
    }
}

export default withData(ProfessorView);
