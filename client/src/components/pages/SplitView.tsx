import * as React from 'react';
import * as H from 'history';

import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionJoinButton from '../includes/SessionJoinButton';
import ConnectedSessionQuestions from '../includes/ConnectedSessionQuestions';

import CalendarHeader from '../includes/CalendarHeader';
import CalendarDateSelect from '../includes/CalendarDateSelect';
import CalendarSessions from '../includes/CalendarSessions';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';

class SplitView extends React.Component {

    props: {
        match: {
            params: {
                courseId: number,
                sessionId: number | null
            }
        },
        history: H.History
    };

    monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    state: {
        selectedWeekEpoch: number,
        selectedDateEpoch: number,
        sessionId: number,
        width: number,
        height: number,
        activeView: string
    };

    componentDidMount() {
        this.updateWindowDimensions();
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
            width: 0,
            height: 0,
            activeView: 'calendar'
        };
        this.handleWeekClick = this.handleWeekClick.bind(this);
        this.handleDateClick = this.handleDateClick.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.props.history.listen((location, action) => {
            if (this.props.match.params.sessionId) {
                this.setState((prevState) => {
                    return { activeView: 'session', sessionId: this.props.match.params.sessionId };
                });
            } else {
                this.setState((prevState) => {
                    return { activeView: 'calendar', sessionId: -1 };
                });
            }
        });
    }

    // Currently unused function, might be useful in the future
    getWeekText(epoch: number): string {
        var now = new Date(epoch);
        var weekText = '';
        weekText += now.getDate();
        weekText += ' - ';
        now.setTime(now.getTime() +
            6 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */);
        weekText += now.getDate();
        weekText += ' ';
        weekText += this.monthNames[now.getMonth()];
        return weekText;
    }

    getWeek(epoch: number): string {
        var now = new Date(epoch);
        var weekText = '';
        weekText += now.getDate();
        weekText += ' - ';
        now.setTime(now.getTime() +
            6 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */);
        weekText += now.getDate();
        return weekText;
    }

    getMonth(epoch: number): string {
        var now = new Date(epoch);
        return this.monthNames[now.getMonth()];
    }

    // newDateIndex is an index between 0 and 6 inclusive, representing which of the days
    // in the current week has been selected
    handleDateClick(newDateIndex: number) {
        this.setState({
            selectedDateEpoch: this.state.selectedWeekEpoch +
                newDateIndex * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */
        });
    }

    // previousWeek = true means that the previous week was clicked in the week selector
    // previousWeek = false means that the next week was clicked in the week selector
    handleWeekClick(previousWeek: boolean) {
        if (previousWeek) {
            this.setState({
                selectedWeekEpoch: this.state.selectedWeekEpoch -
                    7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */,
                selectedDateEpoch: this.state.selectedDateEpoch -
                    7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */
            });
        } else {
            this.setState({
                selectedWeekEpoch: this.state.selectedWeekEpoch +
                    7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */,
                selectedDateEpoch: this.state.selectedDateEpoch +
                    7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */
            });
        }
    }

    handleSessionClick = (sessionId: number) => {
        this.props.history.push('/course/1/session/' + sessionId);
        this.setState((prevState) => {
            return { sessionId: sessionId, activeView: 'session' };
        });
    }

    handleBackClick = () => {
        this.props.history.push('/course/1');
        this.setState((prevState) => {
            return { activeView: 'calendar', sessionId: -1 };
        });
    }

    render() {
        var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        var dates = [];

        var now = new Date(this.state.selectedWeekEpoch);

        for (var i = 0; i < 7; i++) {
            dates.push(now.getDate());
            now.setTime(now.getTime() + 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */);
        }

        const thisWeek = this.getWeek(this.state.selectedWeekEpoch);
        const thisMonth = this.getMonth(this.state.selectedWeekEpoch);

        var selectedDate = new Date(this.state.selectedDateEpoch);
        const todayIndex = ((selectedDate.getDay() - 1) + 7) % 7;

        return (
            <React.Fragment>
                {(this.state.width > 600 || (this.state.width <= 600 && this.state.activeView === 'calendar')) &&
                    <aside className="CalendarView">
                        <div className="Header">
                            <CalendarHeader
                                currentCourse="CS 1380"
                                userId={1}
                                courseId={this.props.match.params.courseId}
                            />
                            <CalendarWeekSelect
                                thisMonth={thisMonth}
                                thisWeek={thisWeek}
                                handleClick={this.handleWeekClick}
                            />
                        </div>
                        <CalendarDateSelect
                            dayList={days}
                            dateList={dates}
                            handleClick={this.handleDateClick}
                            selectedIndex={todayIndex}
                        />
                        <CalendarSessions
                            beginTime={new Date(this.state.selectedDateEpoch)}
                            endTime={new Date(this.state.selectedDateEpoch + 24 * 60 /* minutes */ * 60 * 1000)}
                            courseId={this.props.match.params.courseId}
                            data={{ loading: true }}
                            callback={this.handleSessionClick}
                        />
                    </aside>
                }
                {(this.state.width > 600 || (this.state.width <= 600 && this.state.activeView !== 'calendar')) &&
                    <section className={'StudentSessionView '}>
                        {this.state.sessionId === -1 ?
                            <p className="noSessionSelected">Please Select an Office Hour from the Calendar.</p>
                            : <React.Fragment>
                                <SessionInformationHeader
                                    sessionId={this.state.sessionId}
                                    data={{}}
                                    callback={this.handleBackClick}
                                />
                                <SessionJoinButton />
                                <div className="splitQuestions">
                                    <ConnectedSessionQuestions
                                        sessionId={this.state.sessionId}
                                        isTA={false}
                                        data={{}}
                                        userId={1}
                                    />
                                </div>
                            </React.Fragment>
                        }
                    </section>
                }
            </React.Fragment>
        );
    }
}
export default SplitView;
