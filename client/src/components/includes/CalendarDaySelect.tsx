import * as React from 'react';
import CalendarDateItem from './CalendarDateItem';

import chevron from '../../media/chevron.svg';

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;
const ONE_WEEK = 7 /* days */ * ONE_DAY;
const dayList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

class CalendarDaySelect extends React.Component {

    props!: {
        callback: (time: number) => void;
    };

    state!: {
        selectedWeekEpoch: number;
        active: number;
    };

    constructor(props: {}) {
        super(props);
        const week = new Date(); // now
        week.setHours(0, 0, 0, 0); // beginning of today (00:00:00.000)
        const daysSinceMonday = ((week.getDay() - 1) + 7) % 7;
        week.setTime(week.getTime() - daysSinceMonday * ONE_DAY); // beginning of this week's Monday
        this.state = {
            selectedWeekEpoch: week.getTime(),
            active: daysSinceMonday   // index of currently selected date
        };
    }

    componentDidMount() {
        // TODO: this is a super hacky way of getting around the bug where the current day's
        // sessions do not get displayed on load. This simulates a click on the current day
        // to refetch the query; if you see a way to fix this sustainably, please do so!
        this.handleDateClick(this.state.active);
    }

    incrementWeek = (forward: boolean) => {
        const newDate = this.state.selectedWeekEpoch + (forward ? ONE_WEEK : -ONE_WEEK);
        this.setState({ selectedWeekEpoch: newDate });
        this.props.callback(newDate + this.state.active * ONE_DAY);
    };

    handleDateClick = (item: number) => {
        this.setState({ active: item });
        this.props.callback(this.state.selectedWeekEpoch + item * ONE_DAY);
    };

    render() {
        const now = new Date(this.state.selectedWeekEpoch);
        return (
            <div className="CalendarDaySelect">
                <p className="month">{monthNames[now.getMonth()]}</p>
                <div className="selector">
                    <span className="LastWeek" onClick={() => this.incrementWeek(false)}>
                        <img src={chevron} alt="Previous Week" className="flipped" />
                    </span>
                    {dayList.map((day, i) => <CalendarDateItem
                        key={i}
                        index={i}
                        day={day}
                        date={new Date(now.getTime() + i * ONE_DAY).getDate()}
                        active={i === this.state.active}
                        handleClick={this.handleDateClick}
                    />)}
                    <span className="NextWeek" onClick={() => this.incrementWeek(true)}>
                        <img src={chevron} alt="Next Week" />
                    </span>
                </div>
            </div>
        );
    }
}

export default CalendarDaySelect;
