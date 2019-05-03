import React, { useState } from 'react';
import CalendarDateItem from './CalendarDateItem';

import chevron from '../../media/chevron.svg';

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000;
const ONE_WEEK = 7 /* days */ * ONE_DAY;
const dayList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];


const CalendarDaySelect = (props: {
    callback: Function;
}) => {
    const week = new Date(); // now
    week.setHours(0, 0, 0, 0); // beginning of today (00:00:00.000)
    const daysSinceMonday = ((week.getDay() - 1) + 7) % 7;
    week.setTime(week.getTime() - daysSinceMonday * ONE_DAY); // beginning of this week's Monday
    // this.state = {
    //     selectedWeekEpoch: week.getTime(),
    //     active: daysSinceMonday   // index of currently selected date
    // };
    const [selectedWeekEpoch, setSelectedWeekEpoch] = useState(week.getTime());
    const [active, setActive] = useState(daysSinceMonday);

    const now = new Date(selectedWeekEpoch);

    const incrementWeek = (forward: boolean) => {
        const newDate = selectedWeekEpoch + (forward ? ONE_WEEK : -ONE_WEEK);
        setSelectedWeekEpoch(newDate);
        props.callback(newDate + active * ONE_DAY);
    };

    return (
        <div className="CalendarDaySelect">
            <p className="month">{monthNames[now.getMonth()]}</p>
            <div className="selector">
                <span className="LastWeek" onClick={() => incrementWeek(false)}>
                    <img src={chevron} alt="Previous Week" className="flipped" />
                </span>
                {dayList.map((day, i) => <CalendarDateItem
                    key={day}
                    index={i}
                    day={day}
                    date={new Date(now.getTime() + i * ONE_DAY).getDate()}
                    active={i === active}
                    handleClick={(item: number) => {
                        setActive(item);
                    }}
                />)}
                <span className="NextWeek" onClick={() => incrementWeek(true)}>
                    <img src={chevron} alt="Next Week" />
                </span>
            </div>
        </div>
    );
};

export default CalendarDaySelect;
