import React, { useState } from 'react';

import chevron from '../../media/chevron.svg';

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000;

const CalendarWeekSelect = (props: {
    handleClick?: Function;
    selectedWeekEpoch?: number;
}) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const week = new Date();
    week.setHours(0, 0, 0, 0);
    const daysSinceMonday = ((week.getDay() - 1) + 7) % 7;
    week.setTime(week.getTime() - daysSinceMonday * ONE_DAY); // beginning of this week's Monday

    const [selectedWeekEpoch, setSelectedWeekEpoch] = useState(props.selectedWeekEpoch || week.getTime());


    // getWeekText(epoch: number): string {
    //     var now = new Date(epoch);
    //     var weekText = '';
    //     weekText += now.getDate();
    //     weekText += ' - ';
    //     now.setTime(now.getTime() +
    //         6 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */);
    //     weekText += now.getDate();
    //     return weekText;
    // }

    const getMonth = (epoch: number): string => {
        const now = new Date(epoch);
        return monthNames[now.getMonth()];
    };

    const getDay = (epoch: number): number => {
        const now = new Date(epoch);
        return now.getDate();
    };

    // previousWeek = true means that the previous week was clicked in the week selector
    // previousWeek = false means that the next week was clicked in the week selector
    const handleWeekClick = (previousWeek: boolean) => {
        setSelectedWeekEpoch(selectedWeekEpoch + (previousWeek ? -7 : 7) * ONE_DAY);
        if (props.handleClick !== undefined) {
            props.handleClick(previousWeek);
        }
    };

    // const thisWeek = getWeek(selectedWeekEpoch);
    // const thisMonth = getMonth(selectedWeekEpoch);

    const thisWeekEpoch = selectedWeekEpoch;
    const nextWeekEpoch = selectedWeekEpoch + 7 /* days */ * ONE_DAY;

    return (
        <div className="CalendarWeekSelect">
            <span className="LastWeek" onClick={() => handleWeekClick(true)}>
                <img src={chevron} alt="Previous Week" className="flipped" />
            </span>
            <div className="CurrentWeek">
                <span className="Date">
                    <span className="Month">
                        {getMonth(thisWeekEpoch)}
                    </span>
                    {` ${getDay(thisWeekEpoch)}`}
                </span>
                -
                <span className="Date">
                    <span className="Month">
                        {getMonth(nextWeekEpoch)}
                    </span>
                    {` ${getDay(nextWeekEpoch)}`}
                </span>
            </div>
            <span className="NextWeek" onClick={() => handleWeekClick(false)}>
                <img src={chevron} alt="Next Week" />
            </span>
        </div>
    );
};

export default CalendarWeekSelect;
