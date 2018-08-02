import * as React from 'react';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import CalendarHeader from './CalendarHeader';
import CalendarDaySelect from './CalendarDaySelect';
import CalendarSessions from './CalendarSessions';

const GET_CALENDAR_DATA = gql`
    query getDataForDay(
        $courseId: Int!,
        $beginTime: Datetime!,
        $endTime: Datetime!
    ) {
        apiGetCurrentUser {
            nodes {
                computedName
                computedAvatar
                courseUsersByUserId(condition:{courseId:$courseId}) {
                    nodes {
                        role
                        userId
                    }
                }
            }
        }
        courseByCourseId(courseId: $courseId) {
            name
            code
        }
        apiGetSessions(
            _beginTime: $beginTime,
            _endTime: $endTime,
            _courseId:  $courseId
        ){
            nodes {
                sessionId
                startTime
                endTime
                building
                room
                questionsBySessionId {
                    nodes {
                        status
                    }
                }
                sessionTasBySessionId {
                    nodes {
                        userByUserId {
                            computedName
                            computedAvatar
                        }
                    }
                }
            }
        }
    }
`;

interface AppData {
    courseByCourseId: AppCourse;
    apiGetSessions: {
        nodes: [AppSession];
    };
    apiGetCurrentUser: {
        nodes: [AppUserRole]
    };
}

interface Variables {
    courseId: number;
    beginTime: Date;
    endTime: Date;
}

class DaySessionDataQuery extends Query<AppData, Variables> { }

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;

class CalendarView extends React.Component {
    props: {
        courseId: number,
        sessionId: number,
        sessionCallback: Function,
    };

    state: {
        selectedDateEpoch: number,
    };

    constructor(props: {}) {
        super(props);
        this.state = { selectedDateEpoch: new Date().setHours(0, 0, 0, 0) };
    }

    handleDateClick = (newDateEpoch: number) => {
        this.setState({ selectedDateEpoch: newDateEpoch });
    }

    render() {
        var selectedDate = new Date(this.state.selectedDateEpoch);

        return (
            <DaySessionDataQuery
                query={GET_CALENDAR_DATA}
                pollInterval={30000}
                variables={{
                    beginTime: selectedDate,
                    endTime: new Date(this.state.selectedDateEpoch + ONE_DAY),
                    courseId: this.props.courseId
                }}
            >
                {({ loading, data, error }) => {
                    if (error) { return <h1>ERROR</h1>; }
                    if (!data) { return <div>Loading...</div>; }
                    return (
                        <aside className="CalendarView">
                            <CalendarHeader
                                currentCourseCode={
                                    data.courseByCourseId && data.courseByCourseId.code || 'Loading'}
                                isTa={data.apiGetCurrentUser && data.apiGetCurrentUser.nodes[0]
                                    .courseUsersByUserId.nodes[0].role !== 'student'}
                                avatar={data.apiGetCurrentUser && data.apiGetCurrentUser.nodes[0].computedAvatar}
                            />
                            <CalendarDaySelect callback={this.handleDateClick} />
                            <CalendarSessions
                                loading={loading}
                                sessions={data.apiGetSessions && data.apiGetSessions.nodes}
                                callback={this.props.sessionCallback}
                                activeSessionId={this.props.sessionId}
                            />
                        </aside>
                    );
                }}
            </DaySessionDataQuery>
        );
    }
}

export default CalendarView;
