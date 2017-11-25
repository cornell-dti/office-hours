import * as React from 'react';
import '../../styles/CalendarView.css';
import CalendarHeader from '../includes/CalendarHeader';
import CalendarDateSelect from '../includes/CalendarDateSelect';
import CalendarSessions from '../includes/CalendarSessions';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';

class CalendarView extends React.Component {
    render() {
        return (
            <div className="CalendarView">
                <CalendarHeader />
                <CalendarDateSelect />
                <CalendarSessions />
                <CalendarWeekSelect />
            </div>
        );
    }
}

export default CalendarView;