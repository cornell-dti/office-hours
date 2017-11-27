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
                <CalendarHeader
                    currentCourse="CS 3110"
                />
                <CalendarDateSelect />
                <CalendarSessions />
                <CalendarWeekSelect
                    thisWeek="10 - 16 November"
                    nextWeek="16 - 22 November"
                />
            </div>
        );
    }
}

export default CalendarView;