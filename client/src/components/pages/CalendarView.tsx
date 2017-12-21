import * as React from 'react';
import '../../styles/CalendarView.css';
import CalendarHeader from '../includes/CalendarHeader';
import CalendarDateSelect from '../includes/CalendarDateSelect';
import CalendarSessions from '../includes/CalendarSessions';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';

class CalendarView extends React.Component {
    render() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dates = [10, 11, 12, 13, 14, 15, 16];
        const hasOHs = [true, false, true, true, false, false, false];

        return (
            <div className="CalendarView">
                <CalendarHeader currentCourse="CS2800" />
                <CalendarDateSelect dayList={days} dateList={dates} hasOHList={hasOHs} />
                <CalendarSessions currentCourse="CS2800" />
                <CalendarWeekSelect
                    thisWeek="10 - 16 November"
                    nextWeek="16 - 22 November"
                />
            </div>
        );
    }
}

export default CalendarView;