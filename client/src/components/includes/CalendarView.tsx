import * as React from 'react';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import CalendarHeader from '../includes/CalendarHeader';
import CalendarDateSelect from '../includes/CalendarDateSelect';
import CalendarSessions from '../includes/CalendarSessions';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';

const GET_CALENDAR_DATA = gql`
    query getDataForDay(
        $courseId: Int!,
        $beginTime: Datetime!,
        $endTime: Datetime!
    ) {
        apiGetCurrentUser {
            nodes {
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
                            firstName
                            lastName
                            photoUrl
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
const ONE_WEEK = 7 * ONE_DAY;

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

class CalendarView extends React.Component {
    props: {
        courseId: number,
        sessionId: number,
        // isDesktop: boolean,
        sessionCallback: Function,
    };

    state: {
        selectedWeekEpoch: number,
        selectedDateEpoch: number,
    };

    constructor(props: {}) {
        super(props);
        var week = new Date();
        week.setHours(0, 0, 0, 0);

        week.setDate(week.getDate() + 1 - week.getDay());
        var today = new Date();
        today.setHours(0, 0, 0, 0);

        this.state = {
            selectedWeekEpoch: week.getTime(),
            selectedDateEpoch: today.getTime(),
        };

        this.handleDateClick = this.handleDateClick.bind(this);
        this.handleWeekClick = this.handleWeekClick.bind(this);
    }

    // Currently unused function, might be useful in the future
    getWeekText(epoch: number): string {
        var now = new Date(epoch);
        var weekText = '';
        weekText += now.getDate();
        weekText += ' - ';
        now.setTime(now.getTime() + 6 /* days */ * ONE_DAY);
        weekText += now.getDate();
        weekText += ' ';
        weekText += monthNames[now.getMonth()];
        return weekText;
    }

    // Update state used for date picker
    handleWeekClick(previousWeek: boolean) {
        if (previousWeek) {
            this.setState({
                selectedWeekEpoch: this.state.selectedWeekEpoch - ONE_WEEK,
                selectedDateEpoch: this.state.selectedDateEpoch - ONE_WEEK
            });
        } else {
            this.setState({
                selectedWeekEpoch: this.state.selectedWeekEpoch + ONE_WEEK,
                selectedDateEpoch: this.state.selectedDateEpoch + ONE_WEEK
            });
        }
    }

    // newDateIndex is an index between 0 and 6 inclusive, representing which of the days
    // in the current week has been selected
    handleDateClick(newDateIndex: number) {
        this.setState({ selectedDateEpoch: this.state.selectedWeekEpoch + newDateIndex * ONE_DAY });
    }

    render() {
        var dates: number[] = [];

        var now = new Date(this.state.selectedWeekEpoch);

        for (var i = 0; i < 7; i++) {
            dates.push(now.getDate());
            now.setTime(now.getTime() + ONE_DAY);
        }

        var selectedDate = new Date(this.state.selectedDateEpoch);
        const todayIndex = ((selectedDate.getDay() - 1) + 7) % 7;

        return (
            <DaySessionDataQuery
                query={GET_CALENDAR_DATA}
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
                            <div className="Header">
                                <CalendarHeader
                                    currentCourseCode={
                                        data.courseByCourseId && data.courseByCourseId.code || 'Loading'}
                                    isTa={data.apiGetCurrentUser && data.apiGetCurrentUser.nodes[0].
                                        courseUsersByUserId.nodes[0].role !== 'student'}
                                />
                                <CalendarWeekSelect handleClick={this.handleWeekClick} />
                            </div>
                            <CalendarDateSelect
                                dateList={dates}
                                handleClick={this.handleDateClick}
                                selectedIndex={todayIndex}
                            />
                            <CalendarSessions
                                loading={loading}
                                sessions={data.apiGetSessions ? data.apiGetSessions.nodes : null}
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
