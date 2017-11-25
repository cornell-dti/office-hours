import * as React from 'react';
import '../../styles/CalendarWeekSelect.css';

class CalendarWeekSelect extends React.Component {
    render() {
        return (
            <div className="CalendarWeekSelect">
                <div className="CurrentWeek">
                    <div className="ThisWeek">
                        This Week
                    </div>
                    <div>
                        10 - 16 November
                    </div>
                </div>
                <div className="NextWeek">
                    16 - 22 November
                    <button className="NextButton">
                        >
                </button>
                </div>

            </div>
        );
    }
}

export default CalendarWeekSelect;