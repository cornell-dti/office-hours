import React, { Dispatch, SetStateAction, ReactElement, useState } from 'react';
import { groupBy } from 'lodash';
import {Icon} from 'semantic-ui-react'

import CalendarSessionCard from './CalendarSessionCard';
import CalendarExport from '../../media/calendar_export.svg';

const CalendarSessions = ({
    activeSession,
    course,
    sessions,
    callback,
    setShowCalendarModal,
    setIsDayExport,
    setCurrentExportSessions,
}: {
    activeSession?: FireSession;
    course: FireCourse;
    sessions: FireSession[];
    callback: (sessionId: string) => void;
    setShowCalendarModal: Dispatch<SetStateAction<boolean>>;
    setIsDayExport: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentExportSessions: React.Dispatch<SetStateAction<FireSession[]>>;
}) => {
    const labelSession = (session: FireSession, intervalMs: number) => {
        if (new Date(session.endTime.toDate()) < new Date()) {
            return 'Past';
        }
        if (new Date(session.startTime.toDate()) < new Date()) {
            return 'Ongoing';
        }
        if (
            new Date(session.startTime.toDate()) <
            new Date(new Date().getTime() + intervalMs)
        ) {
            return 'Open';
        }

        return 'Upcoming';
    };

    const sessionCards = sessions.map((session) => {
        return (
            <CalendarSessionCard
                course={course}
                session={session}
                key={session.sessionId}
                callback={callback}
                active={
                    activeSession
                        ? activeSession.sessionId === session.sessionId
                        : false
                }
                status={labelSession(session, course.queueOpenInterval * 1000)}
                setShowCalendarModal={setShowCalendarModal}
                setIsDayExport={setIsDayExport}
                setCurrentExportSessions={setCurrentExportSessions}
            />
        );
    });
    const groupedCards =
        sessionCards &&
        groupBy(sessionCards, (card: ReactElement) => card.props.status);

    const [collapsed, setCollapsed] = useState(
        'Open' in groupedCards || 
      'Ongoing' in groupedCards || 
      'Upcoming' in groupedCards
    );


    const showCalendarExportModal = () => {
        setShowCalendarModal(true);
        setIsDayExport(true);
        setCurrentExportSessions(sessions);
    };

    const getDateString = (): string => {
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        const dateStr = (
            `${days[sessions[0].startTime.toDate().getDay()]}, ` + 
            `${months[sessions[0].startTime.toDate().getMonth()]} ` +
            `${sessions[0].startTime.toDate().getDate()}`);
        return dateStr;
    }

    return (
        <div className='CalendarSessions'>
            {sessions.length === 0 && (
                <>
                    <p className='noHoursHeading'>No Office Hours</p>
                    <p className='noHoursBody'>
                        No office hours are scheduled for today.
                    </p>
                </>
            )}
            {sessions.length !== 0 &&
                <div className='DateWrapper'>
                    <p>{getDateString()}</p>
                    <img
                        src={CalendarExport}
                        alt='Export to calendar'
                        className='CalendarExportIcon'
                        onClick={showCalendarExportModal}
                    />
                </div>
            }
            {groupedCards && (
                <>
                    {'Past' in groupedCards && (collapsed ? (
                        <>
                            <div className="pastHeader">
                                <h6>Past</h6>
                                <Icon name='chevron down' onClick={() => {setCollapsed(false)}}/>
                            </div>
                        </>
                    ) : 
                        (<>
                            <div className="pastHeader">
                                <h6>Past</h6>
                                <Icon name='chevron up' onClick={() => setCollapsed(true)}/>
                            </div>
                            {groupedCards.Past}
                        </>
                        ))}
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
    activeSession: undefined,
};

export default CalendarSessions;
