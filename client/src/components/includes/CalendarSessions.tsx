import * as React from 'react';
import { Loader } from 'semantic-ui-react';

import CalendarSessionCard from './CalendarSessionCard';

class CalendarSessions extends React.Component {
    props: {
        loading: boolean;
        sessions: AppSession[] | null;
        activeSessionId: number;
        callback: Function;
    };
    render() {
        const callback = this.props.callback;
        const activeSessionId = this.props.activeSessionId;
        const loading = this.props.loading;
        const sessions = this.props.sessions;

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
                        callback={callback}
                        active={session.sessionId === activeSessionId}
                    />
                ))}
            </div>
        );
    }
}

export default CalendarSessions;
