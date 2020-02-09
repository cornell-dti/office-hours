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
import { Icon } from 'semantic-ui-react';
import ProfessorDelete from '../includes/ProfessorDelete';
import ProfessorSettings from '../includes/ProfessorSettings';

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
            title
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
        queueOpenInterval {
            minutes
        }
        charLimit
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
        queueOpenInterval: {
            minutes: number
        }
        charLimit: number
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
        selectedWeekEpoch: number,
        isSettingsVisible: boolean
    };

    props: {
        match: {
            params: {
                courseId: string;
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
            selectedWeekEpoch: week.getTime(),
            isSettingsVisible: false
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
        let courseId = parseInt(this.props.match.params.courseId, 10);
        return (
            <div className="ProfessorView">
                <ProfessorMetadataDataQuery query={METADATA_QUERY} variables={{ courseId: courseId }} >
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
                                    courseId={courseId}
                                    code={courseCode}
                                    selected={0}
                                />
                                {data && data.apiGetCurrentUser &&
                                    <TopBar
                                        courseId={courseId}
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
                        courseId: courseId,
                        beginTime: new Date(this.state.selectedWeekEpoch),
                        endTime: new Date(this.state.selectedWeekEpoch +
                            7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */)
                    }}
                    fetchPolicy="network-only" // change this to no-cache when it is fixed in Apollo
                >
                    {({ loading, data, refetch }) => {
                        var taOptions: DropdownItemProps[] = [{ key: -1, text: 'TA Name' }];
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
                                        courseId={courseId}
                                        refreshCallback={refetch}
                                        taOptions={taOptions}
                                    />
                                    <button
                                        id="profSettings"
                                        onClick={() => this.setState({
                                            isSettingsVisible: !this.state.isSettingsVisible
                                        })}
                                    >
                                        <Icon name="setting" />
                                        Settings
                                    </button>
                                    {data && data.apiGetSessions &&
                                        <ProfessorDelete
                                            isDeleteVisible={this.state.isSettingsVisible}
                                            updateDeleteVisible={() => this.setState({
                                                isSettingsVisible: !this.state.isSettingsVisible
                                            })}
                                            content={
                                                <ProfessorSettings
                                                    courseId={courseId}
                                                    charLimitDefault={data.courseByCourseId.charLimit}
                                                    openIntervalDefault={
                                                        data.courseByCourseId.queueOpenInterval.minutes
                                                    }
                                                    toggleDelete={() => this.setState({
                                                        isSettingsVisible: !this.state.isSettingsVisible
                                                    })}
                                                />
                                            }
                                        />
                                    }
                                    <CalendarWeekSelect
                                        handleClick={this.handleWeekClick}
                                        selectedWeekEpoch={this.state.selectedWeekEpoch}
                                    />
                                    <div className="Calendar">
                                        {data && data.apiGetSessions &&
                                            <ProfessorCalendarTable
                                                courseId={courseId}
                                                data={data.apiGetSessions}
                                                taOptions={taOptions}
                                                refreshCallback={refetch}
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
