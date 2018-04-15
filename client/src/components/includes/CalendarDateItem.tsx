import * as React from 'react';

class CalendarDateItem extends React.Component {
    props: {
        index: number,
        active: boolean,
        day: string,
        date: number,
        handleClick: Function
    };

    constructor(props: {}) {
        super(props);
        this._onClick = this._onClick.bind(this);
    }

    _onClick() {
        this.props.handleClick(this.props.index);
    }

    render() {
        var activeClass = 'menuDate';
        if (this.props.active === true) {
            activeClass = 'menuDate active';
        }
        return (
            <div className={activeClass} onClick={this._onClick}>
                <div className="day">{this.props.day}</div>
                <div className="date">{this.props.date}</div>
            </div>
        );
    }
}

export default CalendarDateItem;