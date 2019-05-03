import * as React from 'react';

const CalendarDateItem = (props: {
    index: number;
    active: boolean;
    day: string;
    date: number;
    handleClick: Function;
}) => (
    <div className={`menuDate${props.active ? ' active' : ''}`} onClick={() => props.handleClick(props.index)}>
        <div className="day">{props.day}</div>
        <div className="date">{props.date}</div>
    </div>
);

export default CalendarDateItem;
