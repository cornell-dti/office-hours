import * as React from 'react';

import CalendarHeader from '../includes/calendar/CalendarHeader';
import CalendarDateSelect from '../includes/calendar/CalendarDateSelect';
import CalendarSessions from '../includes/calendar/CalendarSessions';
import CalendarWeekSelect from '../includes/calendar/CalendarWeekSelect';

import '../../styles/calendar/CalendarView.css';

class CalendarView extends React.Component {
    render() {
        return (
            <div className="CalendarView">
                <CalendarHeader />
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
