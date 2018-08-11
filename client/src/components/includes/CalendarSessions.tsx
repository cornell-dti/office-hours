import * as React from 'react';
import { Loader } from 'semantic-ui-react';

import CalendarSessionCard from './CalendarSessionCard';

class CalendarSessions extends React.PureComponent {
    props: {
        loading: boolean;
        sessions: AppSession[] | null;
        activeSessionId: number;
        callback: Function;
        interval: AppInterval;
    };

    render() {
        const loading = this.props.loading;
        const sessions = this.props.sessions;
        const interval = this.props.interval;

        // Isn't it nice how the +'s align?
        const intervalSeconds = !interval ? 0 :
            interval.years * 31556926 +
            interval.months * 2629743 +
            interval.days * 86400 +
            interval.hours * 3600 +
            interval.minutes * 60 +
            interval.seconds;

        return (
            <div className="CalendarSessions">
                {loading && <Loader active={true} content={'Loading'} />}
                {!loading && sessions && sessions.length === 0 &&
                    <React.Fragment>
                        <p className="noHoursHeading">No Office Hours</p>
                        <p className="noHoursBody">No office hours are scheduled for today.</p>
                    </React.Fragment>
                }
                {!loading && sessions && sessions.map(session => (
                    <CalendarSessionCard
                        session={session}
                        key={session.sessionId}
                        callback={this.props.callback}
                        active={session.sessionId === this.props.activeSessionId}
                        opened={new Date(session.startTime) < new Date(new Date().getTime() + intervalSeconds * 1000)}
                    />
                ))}
            </div>
        );
    }
}

export default CalendarSessions;
