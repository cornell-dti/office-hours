import * as React from 'react';

class CalendarWeekSelect extends React.Component {
    props: {
        thisWeekOld: string,
        nextWeek: string,
        thisMonth: string,
        thisWeek: string,
        handleClick: Function
    };

    constructor(props: {}) {
        super(props);
        this._onClick = this._onClick.bind(this);
    }

    _onClick(prev: boolean) {
        this.props.handleClick(prev);
    }

    render() {
        return (
            <div className="CalendarWeekSelect">
                <span className="LastWeek" onClick={() => this._onClick(true)}>
                    <i className="angle left icon" />
                </span>
                <span className="CurrentWeek">
                    <div className="Month">
                        {this.props.thisMonth}
                    </div>
                    <div className="Days">
                        {this.props.thisWeek}
                    </div>
                </span>
                <span className="NextWeek" onClick={() => this._onClick(false)}>
                    <i className="angle right icon" />
                </span>
            </div>
        );
    }
}

export default CalendarWeekSelect;