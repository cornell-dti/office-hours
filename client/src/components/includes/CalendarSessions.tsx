import * as React from 'react';
import CalendarSessionCard from './CalendarSessionCard';

class CalendarSessions extends React.Component {

    props: {
        todayEpoch: number
    };

    render() {
        return (
            <div className="CalendarSessions">
                <CalendarSessionCard
                    start={1485360000}
                    end={1485363600}
                    ta="Corey Valdez"
                    location="Gates G21"
                    resolvedNum={5}
                    aheadNum={23}
                    id={1}
                />
                <CalendarSessionCard
                    start={1485360000}
                    end={1485363600}
                    ta="Edgar Stewart"
                    location="Academic Surge A Tutoring Office 101"
                    resolvedNum={0}
                    aheadNum={3}
                    id={2}
                />
                <CalendarSessionCard
                    start={1485360000}
                    end={1485363600}
                    ta="Ada Morton"
                    location="Academic Surge A Tutoring Office 101"
                    resolvedNum={0}
                    aheadNum={1}
                    id={3}
                />
                <CalendarSessionCard
                    start={1485360000}
                    end={1485363600}
                    ta="Caroline Robinson"
                    location="Gates G21"
                    resolvedNum={0}
                    aheadNum={0}
                    id={4}
                />
            </div>
        );
    }
}

export default CalendarSessions;