import * as React from 'react';
import CalendarHeader from '../includes/CalendarHeader';
import CalendarDateSelect from '../includes/CalendarDateSelect';
import CalendarSessions from '../includes/CalendarSessions';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';

class CalendarView extends React.Component {
    props: {
        match: {
            params: {
                courseId: number
            }
        }
    };

    state: {
        selectedWeekEpoch: number,
        selectedDateEpoch: number
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
            selectedDateEpoch: today.getTime()
        };
        this.handleDateClick = this.handleDateClick.bind(this);
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

    // newDateIndex is an index between 0 and 6 inclusive, representing which of the days
    // in the current week has been selected
    handleDateClick(newDateIndex: number) {
        this.setState({
            selectedDateEpoch: this.state.selectedWeekEpoch +
                newDateIndex * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */
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

        var selectedDate = new Date(this.state.selectedDateEpoch);
        const todayIndex = ((selectedDate.getDay() - 1) + 7) % 7;

        const isTA = false; // TODO fetch from backend

        return (
            <div className="CalendarView">
                <div className="Header">
                    <CalendarHeader
                        currentCourse="CS 1380"
                        isTA={isTA}
                    />
                    <CalendarWeekSelect />
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
            </div>
        );
    }
}

export default CalendarView;
