import * as React from 'react';
import { Loader } from 'semantic-ui-react';
import { groupBy } from 'lodash';
import { Interval } from '../../utilities/interval';

import CalendarSessionCard from './CalendarSessionCard';

class CalendarSessions extends React.PureComponent {
    props: {
        activeSessionId: number;
        myUserId: number;
        loading: boolean;
        sessions: AppSession[] | null;
        callback: Function;
        interval: AppInterval | null;
    };

    labelSession = (session: AppSession, intervalMs: number) => {
        if (new Date(session.endTime) < new Date()) {
            return 'Past';
        } else if (new Date(session.startTime) < new Date()) {
            return 'Ongoing';
        } else if (new Date(session.startTime) < new Date(new Date().getTime() + intervalMs)) {
            return 'Open';
        }
        return 'Upcoming';
    }

    render() {
        const loading = this.props.loading;
        const sessions = this.props.sessions;

        const sessionCards = sessions && sessions.map(session => {
            const sessionAskerIds = session.questionsBySessionId.nodes.map(question => (
                question.userByAskerId && question.userByAskerId.userId
            ));
            const sessionStatuses = session.questionsBySessionId.nodes.map(question => (
                question.status
            ));

            const userQuestionIndex = sessionAskerIds.lastIndexOf(this.props.myUserId);
            const userInQueue = userQuestionIndex === -1 ? false
                : sessionStatuses[userQuestionIndex] === 'unresolved';

            return (
                <CalendarSessionCard
                    includeBookmark={userInQueue}
                    session={session}
                    key={session.sessionId}
                    callback={this.props.callback}
                    active={session.sessionId === this.props.activeSessionId}
                    status={this.labelSession(session, Interval.toMillisecoonds(this.props.interval))}
                />
            );
        });

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
