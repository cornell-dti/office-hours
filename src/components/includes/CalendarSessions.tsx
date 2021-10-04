import * as React from 'react';
import { groupBy } from 'lodash';

import CalendarSessionCard from './CalendarSessionCard';

const CalendarSessions = ({
    activeSession,
    user,
    course,
    sessions,
    callback,
}: {
    activeSession?: FireSession;
    user: FireUser;
    course: FireCourse;
    sessions: FireSession[];
    callback: (sessionId: string) => void;
}) => {
    const labelSession = (session: FireSession, intervalMs: number) => {
        if (new Date(session.endTime.toDate()) < new Date()) {
            return 'Past';
        }
        if (new Date(session.startTime.toDate()) < new Date()) {
            return 'Ongoing';
        }
        if (new Date(session.startTime.toDate()) < new Date(new Date().getTime() + intervalMs)) {
            return 'Open';
        }

        return 'Upcoming';
    };

    const sessionCards = sessions.map(session => {
        return (
            <CalendarSessionCard
                user={user}
                course={course}
                session={session}
                key={session.sessionId}
                callback={callback}
                active={activeSession ? activeSession.sessionId === session.sessionId : false}
                status={labelSession(session, course.queueOpenInterval * 1000)}
            />
        );
    });
    const groupedCards =
        sessionCards && groupBy(sessionCards, (card: React.ReactElement) => card.props.status);
    return (
        <div className="CalendarSessions">
            {sessions.length === 0 && (
                <>
                    <p className="noHoursHeading">No Office Hours</p>
                    <p className="noHoursBody">No office hours are scheduled for today.</p>
                </>
            )}
            {groupedCards && (
                <>
                    {'Past' in groupedCards && (
                        <>
                            <h6>Past</h6>
                            {groupedCards.Past}
                        </>
                    )}
                    {'Open' in groupedCards && (
                        <>
                            <h6>Open</h6>
                            {groupedCards.Open}
                        </>
                    )}
                    {'Ongoing' in groupedCards && (
                        <>
                            <h6>Ongoing</h6>
                            {groupedCards.Ongoing}
                        </>
                    )}
                    {'Upcoming' in groupedCards && (
                        <>
                            <h6>Upcoming</h6>
                            {groupedCards.Upcoming}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

CalendarSessions.defaultProps = {
    activeSession: null,
};

export default CalendarSessions;
