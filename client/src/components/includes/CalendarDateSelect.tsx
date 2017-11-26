import * as React from 'react';
import '../../styles/CalendarDateSelect.css';
import CalendarDateItem from './CalendarDateItem';

class CalendarDateSelect extends React.Component {

    render() {
        return (
            <div className="CalendarDateSelect">
                <div className="CalendarDateSelect-Month">Nov, 2017</div>
                <div className="CalendarDateSelect-Dates">
                    <CalendarDateItem day="Mon" date={10} hasOH={true} active={true} />
                    <CalendarDateItem day="Tue" date={11} hasOH={false} active={false} />
                    <CalendarDateItem day="Wed" date={12} hasOH={true} active={false} />
                    <CalendarDateItem day="Thu" date={13} hasOH={true} active={false} />
                    <CalendarDateItem day="Fri" date={14} hasOH={false} active={false} />
                    <CalendarDateItem day="Sat" date={15} hasOH={false} active={false} />
                    <CalendarDateItem day="Sun" date={16} hasOH={false} active={false} />
                </div>
            </div>
        );
    }
}

export default CalendarDateSelect;