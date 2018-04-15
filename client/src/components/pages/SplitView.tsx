import * as React from 'react';

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
                courseId: number
            }
        }
    };

    monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    state: {
        selectedWeekEpoch: number,
        selectedDateEpoch: number,
        sessionId: number
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
            sessionId: 1
        };
        this.handleWeekClick = this.handleWeekClick.bind(this);
        this.handleDateClick = this.handleDateClick.bind(this);
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
                <aside className="CalendarView">
                    <div className="Header">
                        <CalendarHeader currentCourse="CS 1380" isTA={true} />
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
                        endTime={new Date(this.state.selectedDateEpoch + 24 /* hours */ * 60 /* minutes */ * 60 * 1000)}
                        match={this.props.match}
                        data={{ loading: true }}
                    />
                </aside>
                <section className={'StudentSessionView '}>
                    <SessionInformationHeader
                        sessionId={this.state.sessionId}
                        data={{}}
                    />
                    <SessionJoinButton />
                    <div className="splitQuestions">
                        <ConnectedSessionQuestions sessionId={this.state.sessionId} isTA={false} data={{}} />
                    </div>
                </section>
            </React.Fragment>
        );
    }
}

export default SplitView;
