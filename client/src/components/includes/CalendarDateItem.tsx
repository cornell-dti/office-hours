import * as React from 'react';

class CalendarDateItem extends React.Component {
    props: {
        active: boolean,
        day: string,
        date: number,
        hasOH: boolean,
        onClick: Function
    };
    render() {
        var activeClass = 'menuDate';
        if (this.props.active === true) {
            activeClass = 'menuDate active';
        }
        var notifText = '\u00B7';
        if (this.props.hasOH === false) {
            notifText = '';
        }
        return (
            <div className={activeClass}>
                <div className="notification">{notifText}</div>
                <div className="day">{this.props.day}</div>
                <div className="date">{this.props.date}</div>
            </div>
        );
    }
}

export default CalendarDateItem;