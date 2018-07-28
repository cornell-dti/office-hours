import * as React from 'react';
import CalendarDateItem from './CalendarDateItem';

const chevron = require('../../media/chevron.svg');

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;
const ONE_WEEK = 7 /* days */ * ONE_DAY;
const dayList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

class CalendarDaySelect extends React.Component {

    props: {
        callback: Function,
    };

    state: {
        selectedWeekEpoch: number,
        active: number
    };

    constructor(props: {}) {
        super(props);
        var week = new Date();
        week.setHours(0, 0, 0, 0);
        week.setTime(week.getTime() - (week.getDay() - 1) * ONE_DAY);
        this.state = {
            selectedWeekEpoch: week.getTime(),
            active: 0   // index of currently selected date
        };
    }

    incrementWeek = (forward: boolean) => {
        if (forward) {
            this.setState({ selectedWeekEpoch: this.state.selectedWeekEpoch - ONE_WEEK });
        } else {
            this.setState({ selectedWeekEpoch: this.state.selectedWeekEpoch + ONE_WEEK });
        }
    }

    handleDateClick = (item: number) => {
        this.setState({ active: item });
        this.props.callback(this.state.selectedWeekEpoch + item * ONE_DAY);
    }

    render() {
        const now = new Date(this.state.selectedWeekEpoch);
        return (
            <div className="CalendarDaySelect">
                <p className="month">{monthNames[now.getMonth()]}</p>
                <div className="selector">
                    <span className="LastWeek" onClick={() => this.incrementWeek(true)}>
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
                    <span className="NextWeek" onClick={() => this.incrementWeek(false)}>
                        <img src={chevron} alt="Next Week" />
                    </span>
                </div>
            </div>
        );
    }
}

export default CalendarDaySelect;
