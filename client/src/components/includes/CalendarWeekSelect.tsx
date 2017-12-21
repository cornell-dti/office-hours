import * as React from 'react';
import '../../styles/CalendarWeekSelect.css';

class CalendarWeekSelect extends React.Component {
    props: {
        thisWeek: string,
        nextWeek: string,
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
                <div className="CurrentWeek" onClick={() => this._onClick(true)}>
                    <div className="ThisWeek">
                        This Week
                    </div>
                    {this.props.thisWeek}
                </div>
                <div className="NextWeek" onClick={() => this._onClick(false)}>
                    {this.props.nextWeek}
                    <button className="NextButton">
                        >
                    </button>
                </div>
            </div>
        );
    }
}

export default CalendarWeekSelect;