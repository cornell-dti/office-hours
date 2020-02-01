import * as React from 'react';
import { groupBy } from 'lodash';

import CalendarSessionCard from './CalendarSessionCard';
import { useQuery } from '../../firehooks';
import { firestore } from '../../firebase';

const CalendarSessions = (props: {
    activeSession?: FireSession;
    course: FireCourse;
    callback: (sessionId: string) => void;
}) => {
    const labelSession = (session: FireSession, intervalMs: number) => {
        if (new Date(session.endTime.toDate()) < new Date()) {
            return 'Past';
        } else if (new Date(session.startTime.toDate()) < new Date()) {
            return 'Ongoing';
        } else if (new Date(session.startTime.toDate()) < new Date(new Date().getTime() + intervalMs)) {
            return 'Open';
        }

        return 'Upcoming';
    };

    const getQuery = () => firestore
        .collection('sessions')
        // RYAN_TODO filter based on today's date.
        .where('courseId', '==', firestore.doc('courses/' + props.course.courseId));

    const [sessions, setQuery] = useQuery<FireSession>(getQuery(), 'sessionId');
    // Update query when course id prop changes
    React.useEffect(() => setQuery(getQuery()), [props.course.courseId]);

    const sessionCards = sessions.map(session => {
        // RYAN_TODO
        // const unresolvedQuestions = 0;
        // session.questionsBySessionId.nodes.filter((q) => q.status === 'unresolved');
        const userQuestions = []; // unresolvedQuestions.filter((q) => q.userByAskerId.userId === this.props.myUserId);

        const numAhead = 0;
        // userQuestions.length === 0 ? unresolvedQuestions.length : unresolvedQuestions.filter((q) =>
        //     q.timeEntered <= userQuestions[0].timeEntered).length - 1;

        return (
            <CalendarSessionCard
                includeBookmark={userQuestions.length > 0}
                numAhead={numAhead}
                session={session}
                key={session.sessionId}
                callback={props.callback}
                active={props.activeSession ? props.activeSession.sessionId === session.sessionId : false}
                status={labelSession(session, props.course.queueOpenInterval * 1000)}
            />
        );
    });
    const groupedCards = sessionCards && groupBy(sessionCards, (card: React.ReactElement) => card.props.status);
    return (
        <div className="CalendarSessions">
            {sessions.length === 0 && <React.Fragment>
                <p className="noHoursHeading">No Office Hours</p>
                <p className="noHoursBody">No office hours are scheduled for today.</p>
            </React.Fragment>}
            {groupedCards && <React.Fragment>
                {'Past' in groupedCards && <React.Fragment>
                    <h6>Past</h6>
                    {groupedCards.Past}
                </React.Fragment>}
                {'Open' in groupedCards && <React.Fragment>
                    <h6>Open</h6>
                    {groupedCards.Open}
                </React.Fragment>}
                {'Ongoing' in groupedCards && <React.Fragment>
                    <h6>Ongoing</h6>
                    {groupedCards.Ongoing}
                </React.Fragment>}
                {'Upcoming' in groupedCards && <React.Fragment>
                    <h6>Upcoming</h6>
                    {groupedCards.Upcoming}
                </React.Fragment>}
            </React.Fragment>}
        </div>
    );
};
export default CalendarSessions;
