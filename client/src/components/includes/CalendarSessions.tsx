import * as React from 'react';
import CalendarSessionCard from './CalendarSessionCard';

class CalendarSessions extends React.Component {

    props: {
        todayEpoch: number
    };

    render() {
        var nowTs = -1;
        // if (process.env.NODE_ENV !== 'production') {
        // For testing purposes only 
        if (true) {
            nowTs = Math.round(Date.now() / 1000);
        }
        return (
            <div className="CalendarSessions">
                <CalendarSessionCard
                    start={nowTs - (30 /* minutes */ * 60 /* seconds */)}
                    end={nowTs - (30 /* minutes */ * 60 /* seconds */) + (60 /* minutes */ * 60 /* seconds */)}
                    ta="Corey Valdez"
                    location="Gates G21"
                    resolvedNum={5}
                    aheadNum={23}
                    id={1}
                />
                <CalendarSessionCard
                    start={nowTs}
                    end={nowTs + (60 /* minutes */ * 60 /* seconds */)}
                    ta="Edgar Stewart"
                    location="Academic Surge A Tutoring Office 101"
                    resolvedNum={0}
                    aheadNum={3}
                    id={2}
                />
                <CalendarSessionCard
                    start={nowTs + (30 /* minutes */ * 60 /* seconds */)}
                    end={nowTs + (30 /* minutes */ * 60 /* seconds */) + (60 /* minutes */ * 60 /* seconds */)}
                    ta="Ada Morton"
                    location="Academic Surge A Tutoring Office 101"
                    resolvedNum={0}
                    aheadNum={1}
                    id={3}
                />
                <CalendarSessionCard
                    start={nowTs + (90 /* minutes */ * 60 /* seconds */)}
                    end={nowTs + (90 /* minutes */ * 60 /* seconds */) + (60 /* minutes */ * 60 /* seconds */)}
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
