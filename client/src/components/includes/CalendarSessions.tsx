import * as React from 'react';
import { Loader } from 'semantic-ui-react';
import { groupBy } from 'lodash';

import CalendarSessionCard from './CalendarSessionCard';

class CalendarSessions extends React.PureComponent {
    props: {
        loading: boolean;
        sessions: AppSession[] | null;
        activeSessionId: number;
        callback: Function;
        interval: AppInterval;
    };

    labelSession = (session: AppSession, intervalSeconds: number) => {
        if (new Date(session.endTime) < new Date()) {
            return 'Past';
        } else if (new Date(session.startTime) < new Date()) {
            return 'Ongoing';
        } else if (new Date(session.startTime) < new Date(new Date().getTime() + intervalSeconds * 1000)) {
            return 'Open';
        }
        return 'Upcoming';
    }

    render() {
        const loading = this.props.loading;
        const sessions = this.props.sessions;
        const interval = this.props.interval;

        // Isn't it nice how the +'s align?
        // ternary is a temporary hack is for while data is loading
        // Todo: loading states

        const intervalSeconds = !interval ? 0 :
            interval.years * 31556926 +
            interval.months * 2629743 +
            interval.days * 86400 +
            interval.hours * 3600 +
            interval.minutes * 60 +
            interval.seconds;

        const sessionCards = sessions && sessions.map(session => (
            <CalendarSessionCard
                session={session}
                key={session.sessionId}
                callback={this.props.callback}
                active={session.sessionId === this.props.activeSessionId}
                status={this.labelSession(session, intervalSeconds)}
            />
        ));

        const groupedCards = sessionCards && groupBy(sessionCards, (card: CalendarSessionCard) => card.props.status);

        return (
            <div className="CalendarSessions">
                {loading && <Loader active={true} content={'Loading'} />}
                {!loading && sessions && sessions.length === 0 &&
                    <React.Fragment>
                        <p className="noHoursHeading">No Office Hours</p>
                        <p className="noHoursBody">No office hours are scheduled for today.</p>
                    </React.Fragment>
                }
                {groupedCards && <React.Fragment>
                    {'Past' in groupedCards &&
                        <React.Fragment>
                            <h6>Past</h6>
                            {groupedCards.Past}
                        </React.Fragment>}
                    {'Open' in groupedCards &&
                        <React.Fragment>
                            <h6>Open</h6>
                            {groupedCards.Open}
                        </React.Fragment>}
                    {'Ongoing' in groupedCards &&
                        <React.Fragment>
                            <h6>Ongoing</h6>
                            {groupedCards.Ongoing}
                        </React.Fragment>}
                    {'Upcoming' in groupedCards &&
                        <React.Fragment>
                            <h6>Upcoming</h6>
                            {groupedCards.Upcoming}
                        </React.Fragment>}
                </React.Fragment>}
            </div>
        );
    }
}

export default CalendarSessions;
