import * as React from 'react';

import '../../../styles/calendar/CalendarWeekSelect.css';

class CalendarWeekSelect extends React.Component {
    props: {
        thisWeek: string,
        nextWeek: string
    };

    render() {
        return (
            <div className="CalendarWeekSelect">
                <div className="CurrentWeek">
                    <div className="ThisWeek">
                        This Week
                    </div>
                    {this.props.thisWeek}
                </div>
                <div className="NextWeek">
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
