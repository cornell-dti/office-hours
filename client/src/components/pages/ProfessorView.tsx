import * as React from 'react';
import ProfessorCalendarTable from '../includes/ProfessorCalendarTable';
import ProfessorAddNew from '../includes/ProfessorAddNew';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { DropdownItemProps } from 'semantic-ui-react';
import 'moment-timezone';
import { Redirect } from 'react-router';

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;

const METADATA_QUERY = gql`
query GetMetadata($courseId: Int!) {
    apiGetCurrentUser {
        nodes {
            computedName
            computedAvatar
            courseUsersByUserId(condition:{courseId:$courseId}) {
                nodes {
                    role
                }
            }
        }
    }
    courseByCourseId(courseId: $courseId) {
        code
    }
}`;

const SESSIONS_QUERY = gql`
query FindSessionsByCourse($courseId: Int!, $beginTime: Datetime!, $endTime: Datetime!) {
    apiGetSessions(_courseId: $courseId, _beginTime: $beginTime, _endTime: $endTime) {
        nodes {
            sessionId
            startTime
            endTime
            building
            room
            sessionSeriesId
            sessionTasBySessionId {
                nodes {
                    userByUserId {
                        computedName
                        userId
                    }
                }
            }
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
    }
}
`;

interface ProfessorMetadataData {
    apiGetCurrentUser: {
        nodes: [AppUserRole]
    };
    courseByCourseId: {
        code: string
    };
}

interface ProfessorSessionsData {
    apiGetSessions: {
        nodes: [AppSession]
    };
    courseByCourseId: {
        tas: {
            nodes: [AppTa]
        }
        professors: {
            nodes: [AppTa]
        }
    };
}

interface MetadataVariables {
    courseId: number;
}

interface SessionsVariables {
    courseId: number;
    beginTime: Date;
    endTime: Date;
}

class ProfessorSessionsDataQuery extends Query<ProfessorSessionsData, SessionsVariables> { }
class ProfessorMetadataDataQuery extends Query<ProfessorMetadataData, MetadataVariables> { }

class ProfessorView extends React.Component {
    state: {
        selectedWeekEpoch: number
    };

    props: {
        match: {
            params: {
                courseId: number;
            }
        }
    };

    constructor(props: {}) {
        super(props);
        var week = new Date();
        week.setHours(0, 0, 0, 0);
        var daysSinceMonday = ((week.getDay() - 1) + 7) % 7;
        week.setTime(week.getTime() - daysSinceMonday * ONE_DAY); // beginning of this week's Monday
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
        return (
            <div className="ProfessorView">
                <ProfessorMetadataDataQuery
                    query={METADATA_QUERY}
                    variables={{
                        courseId: this.props.match.params.courseId
                    }}
                >
                    {({ loading, data }) => {
                        var courseCode: string = 'Loading...';
                        if (!loading && data) {
                            courseCode = data.courseByCourseId.code;
                            if (data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role !== 'professor') {
                                return <Redirect to={'/course/' + this.props.match.params.courseId} />;
                            }
                        }
                        return (
                            <React.Fragment>
                                <ProfessorSidebar
                                    courseId={this.props.match.params.courseId}
                                    code={courseCode}
                                    selected={0}
                                />
                                {data && data.apiGetCurrentUser &&
                                    <TopBar
                                        courseId={this.props.match.params.courseId}
                                        user={data.apiGetCurrentUser.nodes[0]}
                                        context="professor"
                                        role={data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role}
                                    />
                                }
                            </React.Fragment>
                        );
                    }}
                </ProfessorMetadataDataQuery>

                <ProfessorSessionsDataQuery
                    query={SESSIONS_QUERY}
                    variables={{
                        courseId: this.props.match.params.courseId,
                        beginTime: new Date(this.state.selectedWeekEpoch),
                        endTime: new Date(this.state.selectedWeekEpoch +
                            7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */)
                    }}
                    fetchPolicy="network-only" // change this to no-cache when it is fixed in Apollo
                >
                    {({ loading, data, refetch }) => {
                        var taOptions: DropdownItemProps[] = [];
                        if (!loading && data) {
                            data.courseByCourseId.tas.nodes.forEach((node) => {
                                taOptions.push({
                                    value: node.userByUserId.userId,
                                    text: node.userByUserId.computedName
                                });
                            });
                            data.courseByCourseId.professors.nodes.forEach((node) => {
                                taOptions.push({
                                    value: node.userByUserId.userId,
                                    text: node.userByUserId.computedName
                                });
                            });
                        }
                        return (
                            <section className="rightOfSidebar">
                                <div className="main">
                                    <ProfessorAddNew
                                        courseId={this.props.match.params.courseId}
                                        taOptions={taOptions}
                                        refreshCallback={refetch}
                                    />
                                    <CalendarWeekSelect
                                        handleClick={this.handleWeekClick}
                                        selectedWeekEpoch={this.state.selectedWeekEpoch}
                                    />

                                    <div className="Calendar">
                                        {data && data.apiGetSessions &&
                                            <ProfessorCalendarTable
                                                data={data.apiGetSessions}
                                                taOptions={taOptions}
                                                refreshCallback={refetch}
                                                courseId={this.props.match.params.courseId}
                                            />
                                        }
                                    </div>
                                </div>
                            </section>
                        );
                    }}
                </ProfessorSessionsDataQuery>
            </div>
        );
    }
}

export default ProfessorView;
