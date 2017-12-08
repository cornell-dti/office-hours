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
            <h1>Hi</h1>
        );
    }
}

export default CalendarSessions;