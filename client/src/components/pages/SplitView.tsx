import * as React from 'react';
import * as H from 'history';

import SessionView from '../includes/SessionView';
import ConnectedQuestionView from '../includes/ConnectedQuestionView';

import CalendarHeader from '../includes/CalendarHeader';
import CalendarDateSelect from '../includes/CalendarDateSelect';
import CalendarSessions from '../includes/CalendarSessions';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_DATA = gql`
    query getDataForDay(
        $courseId: Int!,
        $beginTime: Datetime,
        $endTime: Datetime
    ) {
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
                        questionId
                        content
                        status
                        timeEntered
                        userByAskerId {
                            firstName
                            lastName
                            photoUrl
                            userId
                        }
                        questionTagsByQuestionId {
                            nodes {
                                tagByTagId {
                                    name
                                    level
                                }
                            }
                        }
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

interface Variables {
    courseId: number;
    beginTime: Date;
    endTime: Date;
}

class AppDataQuery extends Query<AppData, Variables> { }

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;
const ONE_WEEK = 7 /* days */ * ONE_DAY;

// Also update in the main LESS file
const MOBILE_BREAKPOINT = 920;

class SplitView extends React.Component {
    props: {
        history: H.History,
        match: {
            params: {
                courseId: number,
                sessionId: number | null
            }
        }
    };

    monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    state: {
        selectedWeekEpoch: number,
        selectedDateEpoch: number,
        sessionId: number,
        width: number,
        height: number,
        activeView: string,
    };

    // Keep window size in state for conditional rendering
    componentDidMount() {
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

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
            sessionId: this.props.match.params.sessionId || -1,
            width: window.innerWidth,
            height: window.innerHeight,
            activeView: this.props.match.params.sessionId ? 'session' : 'calendar'
        };

        this.handleDateClick = this.handleDateClick.bind(this);
        this.handleWeekClick = this.handleWeekClick.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

        // Handle browser back button
        this.props.history.listen((location, action) => {
            if (this.props.match.params.sessionId) {
                this.setState({ activeView: 'session', sessionId: this.props.match.params.sessionId });
            } else {
                this.setState({ activeView: 'calendar', sessionId: -1 });
            }
        });
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
        weekText += this.monthNames[now.getMonth()];
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

    // Keep track of active view for mobile
    handleSessionClick = (sessionId: number) => {
        this.props.history.push('/course/1/session/' + sessionId);
        this.setState({ sessionId: sessionId, activeView: 'session' });
    }

    handleJoinClick = () => {
        this.setState({ activeView: 'addQuestion' });
    }

    handleBackClick = () => {
        this.props.history.push('/course/1');
        this.setState({ activeView: 'calendar', sessionId: -1 });
    }

    render() {
        var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        var dates: number[] = [];

        var now = new Date(this.state.selectedWeekEpoch);

        for (var i = 0; i < 7; i++) {
            dates.push(now.getDate());
            now.setTime(now.getTime() + ONE_DAY);
        }

        var selectedDate = new Date(this.state.selectedDateEpoch);
        const todayIndex = ((selectedDate.getDay() - 1) + 7) % 7;

        return (
            <AppDataQuery
                query={GET_DATA}
                variables={{
                    beginTime: selectedDate,
                    endTime: new Date(this.state.selectedDateEpoch + ONE_DAY),
                    courseId: this.props.match.params.courseId
                }}
            >
                {({ loading, data, error }) => {
                    if (error) { return <h1>ERROR</h1>; }
                    if (!data) { return <div>no data</div>; }

                    return (<React.Fragment>
                        {
                            (this.state.width > MOBILE_BREAKPOINT ||
                                (this.state.width <= MOBILE_BREAKPOINT &&
                                    this.state.activeView === 'calendar')) &&
                            <aside className="CalendarView">
                                <div className="Header">
                                    <CalendarHeader
                                        currentCourse="CS 3110"
                                        userId={1}
                                        courseId={this.props.match.params.courseId}
                                    />
                                    <CalendarWeekSelect handleClick={this.handleWeekClick} />
                                </div>
                                <CalendarDateSelect
                                    dayList={days}
                                    dateList={dates}
                                    handleClick={this.handleDateClick}
                                    selectedIndex={todayIndex}
                                />
                                <CalendarSessions
                                    loading={loading}
                                    sessions={data.apiGetSessions ? data.apiGetSessions.nodes : null}
                                    callback={this.handleSessionClick}
                                    activeSessionId={this.state.sessionId}
                                />
                            </aside>
                        }{
                            (this.state.width > MOBILE_BREAKPOINT ||
                                (this.state.width <= MOBILE_BREAKPOINT &&
                                    this.state.activeView !== 'calendar')) &&
                            <SessionView
                                id={this.state.sessionId}
                                isDesktop={this.state.width > MOBILE_BREAKPOINT}
                                backCallback={this.handleBackClick}
                                joinCallback={this.handleJoinClick}
                            />
                        }{
                            (this.state.activeView === 'addQuestion') &&
                            <React.Fragment>
                                <div className="modal">
                                    <ConnectedQuestionView
                                        sessionId={this.state.sessionId || -1}
                                        courseId={this.props.match.params.courseId}
                                        data={{ loading: true }}
                                    />
                                </div>
                                <div className="modalShade" onClick={() => this.setState({ activeView: 'session' })} />
                            </React.Fragment>
                        }

                    </React.Fragment>);
                }}
            </AppDataQuery>
        );
    }
}

export default SplitView;
