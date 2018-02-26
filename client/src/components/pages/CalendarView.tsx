import * as React from 'react';
import '../../styles/CalendarView.css';
import CalendarHeader from '../includes/CalendarHeader';
import CalendarDateSelect from '../includes/CalendarDateSelect';
import CalendarSessions from '../includes/CalendarSessions';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';

class CalendarView extends React.Component {

    monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

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
        this.handleWeekClick = this.handleWeekClick.bind(this);
        this.handleDateClick = this.handleDateClick.bind(this);
    }

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
        var hasOHs = [false, false, false, false, false, false, false];
        var dates = [];

        var now = new Date(this.state.selectedWeekEpoch);
        var monthYear = this.monthNames[now.getMonth()].substring(0, 3) + ', ' + now.getFullYear();

        for (var i = 0; i < 7; i++) {
            dates.push(now.getDate());
            now.setTime(now.getTime() + 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */);
        }

        const thisWeekText = this.getWeekText(this.state.selectedWeekEpoch);
        const nextWeekText = this.getWeekText(this.state.selectedWeekEpoch +
            7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */);

        var selectedDate = new Date(this.state.selectedDateEpoch);
        const todayIndex = ((selectedDate.getDay() - 1) + 7) % 7;

        return (
            <div className="CalendarView">
                <CalendarHeader currentCourse="CS 3110" />
                <CalendarDateSelect
                    dayList={days}
                    dateList={dates}
                    hasOHList={hasOHs}
                    monthYear={monthYear}
                    handleClick={this.handleDateClick}
                    selectedIndex={todayIndex}
                />
                <CalendarSessions todayEpoch={this.state.selectedDateEpoch} />
                <CalendarWeekSelect
                    thisWeek={thisWeekText}
                    nextWeek={nextWeekText}
                    handleClick={this.handleWeekClick}
                />
            </div>
        );
    }
}

export default CalendarView;