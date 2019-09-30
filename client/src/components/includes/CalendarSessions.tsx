import * as React from 'react';
import { groupBy } from 'lodash';
import { firestore, loggedIn$, collectionData } from '../../firebase';

import CalendarSessionCard from './CalendarSessionCard';

class CalendarSessions extends React.PureComponent {
    props: {
        activeSession?: FireSession;
        course: FireCourse;
        // myUserId: number | null;
        // loading: boolean;
        // sessions: AppSession[] | null;
        callback: Function;
    };

    state: {
        userId?: string;
        sessions: FireSession[];
    };

    labelSession = (session: FireSession, intervalMs: number) => {
        if (new Date(session.endTime.seconds) < new Date()) {
            return 'Past';
        } else if (new Date(session.startTime.seconds * 1000) < new Date()) {
            return 'Ongoing';
        } else if (new Date(session.startTime.seconds * 1000) < new Date(new Date().getTime() + intervalMs)) {
            return 'Open';
        }
        return 'Upcoming';
    }

    constructor(props: {}) {
        super(props);
        this.state = { sessions: [] };
        loggedIn$.subscribe(user => this.setState({ userId: user.uid }));
        // RYAN_TODO handle courseId update
        // Shouldn't be necessary, but in principle the component could get out of sync
        // The page should reload when the course changes for now, but that's ideal
        const sessions$ = collectionData(
            firestore
                .collection('sessions')
                .where('courseId', '==', firestore.doc('courses/' + this.props.course.courseId)),
            // RYAN_TODO filter based on today's date.
            'sessionId'
        );

        sessions$.subscribe((sessions: FireSession[]) => this.setState({ sessions }));
    }

    render() {
        const sessions = this.state.sessions;
        const sessionCards = sessions && sessions.map(session => {
            // RYAN_TODO
            // const unresolvedQuestions = 0;
            // session.questionsBySessionId.nodes.filter((q) => q.status === 'unresolved');
            const userQuestions = [];
            // unresolvedQuestions.filter((q) => q.userByAskerId.userId === this.props.myUserId);
            const numAhead = 0;
            // userQuestions.length === 0 ? unresolvedQuestions.length : unresolvedQuestions.filter((q) =>
            //     q.timeEntered <= userQuestions[0].timeEntered).length - 1;

            return (
                <CalendarSessionCard
                    includeBookmark={userQuestions.length > 0}
                    numAhead={numAhead}
                    session={session}
                    key={session.sessionId}
                    callback={this.props.callback}
                    active={this.props.activeSession ? this.props.activeSession.sessionId === session.sessionId : false}
                    status={this.labelSession(session, this.props.course.queueOpenInterval * 1000)}
                />
            );
        });

        const groupedCards = sessionCards && groupBy(sessionCards, (card: CalendarSessionCard) => card.props.status);

        return (
            <div className="CalendarSessions">
                {sessions.length === 0 &&
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
