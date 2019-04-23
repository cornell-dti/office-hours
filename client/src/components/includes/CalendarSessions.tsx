import * as React from 'react';
import { Loader } from 'semantic-ui-react';
import { groupBy } from 'lodash';

import CalendarSessionCard from './CalendarSessionCard';

class CalendarSessions extends React.PureComponent {
    props: {
        activeSessionId: String;
        myUserId: number | null;
        loading: boolean;
        sessions: FireSession[];
        callback: Function;
        interval: number;
    };

    labelSession = (session: FireSession) => {
        if (new Date(session.endTime.seconds) < new Date()) {
            return 'Past';
        } else if (new Date(session.startTime.seconds) < new Date()) {
            return 'Ongoing';
        } else if (new Date(session.startTime.seconds) < new Date(new Date().getTime() + this.props.interval)) {
            return 'Open';
        }
        return 'Upcoming';
    }

    render() {
        const loading = this.props.loading;
        const sessions = this.props.sessions;

        const sessionCards = sessions && sessions.map(session => {
            // const unresolvedQuestions = 0;
            // session.questionsBySessionId.nodes.filter((q) => q.status === 'unresolved');
            const userQuestions = [];
            // unresolvedQuestions.filter((q) => q.userByAskerId.userId === this.props.myUserId);
            const numAhead = 0;
            // userQuestions.length === 0 ? unresolvedQuestions.length : unresolvedQuestions.filter((q) =>
            // q.timeEntered <= userQuestions[0].timeEntered).length - 1;

            return (
                <CalendarSessionCard
                    includeBookmark={userQuestions.length > 0}
                    numAhead={numAhead}
                    session={session}
                    key={session.id}
                    callback={this.props.callback}
                    active={session.id === this.props.activeSessionId}
                    status={this.labelSession(session)}
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
