import * as React from 'react';

class CalendarSessions extends React.Component {

    props: {
        start: number,
        end: number,
        ta: string,
        location: string,
        resolvedNum: number,
        aheadNum: number
    };

    render() {
        return (
            <div className="CalendarSessionCard">{this.props.ta}</div>
        );
    }
}

export default CalendarSessions;