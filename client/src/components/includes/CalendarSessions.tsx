import * as React from 'react';
import '../../styles/CalendarSessions.css';
import CalendarSessionCard from './CalendarSessionCard';

class CalendarSessions extends React.Component {
    render() {
        return (
            <div className="CalendarSessions">
                <CalendarSessionCard
                    start={1485360000}
                    end={1485363600}
                    ta="Michael Clarkson"
                    location="Gates G11"
                    resolvedNum={5}
                    aheadNum={23}
                />
            </div>
        );
    }
}

export default CalendarSessions;