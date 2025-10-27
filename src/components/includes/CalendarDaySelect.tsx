import * as React from 'react';
import CalendarDateItem from './CalendarDateItem';

import chevron from '../../media/chevron.svg';

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;
const dayList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

type Props = { 
    callback: (time: number) => void; 
    sessionDates: Date[];
};

const CalendarDaySelect: React.FC<Props> = (props) => {
    const { callback } = props;

    const [active, setActive] = React.useState(0);
    
    const [selectedWeekEpoch, setSelectedWeekEpoch] = React.useState(() => {
        const week = new Date(); // now
        week.setHours(0, 0, 0, 0); // beginning of today (00:00:00.000)
        const daysSinceMonday = ((week.getDay() - 1) + 7) % 7; // shift back to Monday of this week
        week.setDate(week.getDate() - daysSinceMonday);

        // TODO(ewlsh) Check that using state setters within state initializers is allowed.
        setActive(daysSinceMonday);

        return week.getTime();
    });

    const incrementWeek = React.useCallback((forward: boolean) => {  
        const d = new Date(selectedWeekEpoch);
        d.setDate(d.getDate() + (forward ? 7 : -7));
        callback(d.getTime() + active * ONE_DAY);
        setSelectedWeekEpoch(d.getTime());
 
    }, [callback, selectedWeekEpoch, active]);

    const  handleDateClick = React.useCallback((item: number) => {
        const d = new Date(selectedWeekEpoch);
        d.setDate(d.getDate() + item);
        callback(selectedWeekEpoch + item * ONE_DAY);

        setActive(item);
    }, [callback, selectedWeekEpoch]);

    const now = new Date(selectedWeekEpoch);

    const hasSessionsDays = new Array(7);
    // compute start and end of the week using calendar arithmetic
    const weekStart = new Date(selectedWeekEpoch);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7); // exactly 7 local days later
    const sessionDays = props.sessionDates
        .filter((d) => d >= weekStart && d < weekEnd)
        .map((d) => d.getDay());
    for (const d of sessionDays) {
        hasSessionsDays[((d - 1) + 7) % 7] = true;
    }

    const getDateAtOffset = (base: Date, offsetDays: number) => {
        const d = new Date(base);
        d.setDate(d.getDate() + offsetDays);
        return d;
    };

    return (
        <div className="CalendarDaySelect">
            <p className="month">{monthNames[now.getMonth()]}</p>
            <div className="selector">
                <button 
                    type="button"
                    className="LastWeek"
                    onClick={() => incrementWeek(false)}
                >
                    <img src={chevron} alt="Previous Week" className="flipped" />
                </button>
                {dayList.map((day, i) => <CalendarDateItem
                    key={day}
                    index={i}
                    day={day}
                    date={getDateAtOffset(now, i).getDate()}
                    active={i === active}
                    handleClick={handleDateClick}
                    hasSession={hasSessionsDays[i]}
                />)}
                <button type="button" className="NextWeek" onClick={() => incrementWeek(true)}>
                    <img src={chevron} alt="Next Week" />
                </button>
            </div>
        </div>
    );

}

export default CalendarDaySelect;
