import * as React from 'react';
import CalendarHeader from '../includes/CalendarHeader';
import CalendarDateSelect from '../includes/CalendarDateSelect';
import CalendarSessions from '../includes/CalendarSessions';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';

class CalendarView extends React.Component {

    state: {
        selectedWeekEpoch: number,
        selectedDateEpoch: number
    };

    constructor(props: {}) {
        super(props);
        var week = new Date();
        week.setHours(0, 0, 0, 0);
        week.setTime(week.getTime() -
            (week.getDay() - 1) /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */);
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
        var hasOHs = [true, false, true, false, true, false, false];
        var dates = [];

        var now = new Date(this.state.selectedWeekEpoch);

        for (var i = 0; i < 7; i++) {
            dates.push(now.getDate());
            now.setTime(now.getTime() + 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */);
        }

        var selectedDate = new Date(this.state.selectedDateEpoch);
        const todayIndex = ((selectedDate.getDay() - 1) + 7) % 7;

        return (
            <div className="CalendarView">
                <div className="Header">
                    <CalendarHeader currentCourse="CS 1380" />
                    <CalendarWeekSelect />
                </div>
                <CalendarDateSelect
                    dayList={days}
                    dateList={dates}
                    hasOHList={hasOHs}
                    handleClick={this.handleDateClick}
                    selectedIndex={todayIndex}
                />
                <CalendarSessions todayEpoch={this.state.selectedDateEpoch} />
            </div>
        );
    }
}

export default CalendarView;