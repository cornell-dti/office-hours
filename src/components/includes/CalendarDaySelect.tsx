import * as React from 'react';
import CalendarDateItem from './CalendarDateItem';

import chevron from '../../media/chevron.svg';

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;
const ONE_WEEK = 7 /* days */ * ONE_DAY;
const dayList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

type Props = { 
    callback: (time: number) => void; 
    sessionDates: Date[];
    activeSessionDay: number | undefined;
};

const CalendarDaySelect: React.FC<Props> = (props) => {
    const { callback } = props;

    const [active, setActive] = React.useState(0);
    
    const [selectedWeekEpoch, setSelectedWeekEpoch] = React.useState(() => {
        const week = new Date(); // now
        week.setHours(0, 0, 0, 0); // beginning of today (00:00:00.000)
        const daysSinceMonday = ((week.getDay() - 1) + 7) % 7;
        week.setTime(week.getTime() - daysSinceMonday * ONE_DAY); // beginning of this week's Monday

        // TODO(ewlsh) Check that using state setters within state initializers is allowed.
        setActive(daysSinceMonday);

        return week.getTime();
    });

    const incrementWeek = React.useCallback((forward: boolean) => {  
        const newDate = selectedWeekEpoch + (forward ? ONE_WEEK : -ONE_WEEK);
            
        callback(newDate + active * ONE_DAY);
            
        setSelectedWeekEpoch(newDate);
 
    }, [callback, selectedWeekEpoch, active]);

    const  handleDateClick = React.useCallback((item: number) => {
        callback(selectedWeekEpoch + item * ONE_DAY);

        setActive(item);
    }, [callback, selectedWeekEpoch]);

    const now = new Date(selectedWeekEpoch);

    const numSessionsDays = new Array(7).fill(0);
    const sessionDays = props.sessionDates
        .filter((d) => d.getTime() >= selectedWeekEpoch && d.getTime() <= selectedWeekEpoch + ONE_WEEK)
        .map((d) => d.getDay());
    for (const d of sessionDays) {
        numSessionsDays[((d - 1) + 7) % 7] += 1;
    }

    const activeSessionDays = new Array(7).fill(0);
    if (props.activeSessionDay !== undefined) {
        activeSessionDays[((props.activeSessionDay - 1) + 7) % 7] = 1;
    }

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
                    date={new Date(now.getTime() + i * ONE_DAY).getDate()}
                    active={i === active}
                    handleClick={handleDateClick}
                    numSessions={numSessionsDays[i]}
                    activeSession={activeSessionDays[i]}
                />)}
                <button type="button" className="NextWeek" onClick={() => incrementWeek(true)}>
                    <img src={chevron} alt="Next Week" />
                </button>
            </div>
        </div>
    );

}

export default CalendarDaySelect;
