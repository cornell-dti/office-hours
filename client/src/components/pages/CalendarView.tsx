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
        currentEpoch: number
    };

    constructor(props: {}) {
        super(props);
        this.state = { currentEpoch: new Date().getTime() };
        this.handleWeekClick = this.handleWeekClick.bind(this);
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

    // previousWeek = true means that the previous week was clicked in the week selector
    // previousWeek = false means that the next week was clicked in the week selector
    handleWeekClick(previousWeek: boolean) {
        if (previousWeek) {
            this.setState({
                currentEpoch: this.state.currentEpoch -
                    7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */
            });
        } else {
            this.setState({
                currentEpoch: this.state.currentEpoch +
                    7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */
            });
        }
    }

    render() {
        var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var hasOHs = [false, false, false, false, false, false, false];
        var dates = [];

        var now = new Date(this.state.currentEpoch);
        var monthYear = this.monthNames[now.getMonth()] + ' ' + now.getFullYear();

        var todayIndex = now.getDay();
        days = days.slice(todayIndex).concat(days.splice(0, todayIndex));

        for (var i = 0; i < 7; i++) {
            dates.push(now.getDate());
            now.setTime(now.getTime() + 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */);
        }

        const thisWeekText = this.getWeekText(this.state.currentEpoch);
        const nextWeekText = this.getWeekText(this.state.currentEpoch +
            7 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */);

        return (
            <div className="CalendarView">
                <CalendarHeader currentCourse="CS 3110" />
                <CalendarDateSelect
                    dayList={days}
                    dateList={dates}
                    hasOHList={hasOHs}
                    monthYear={monthYear}
                />
                <CalendarSessions />
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