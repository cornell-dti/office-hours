import React, { useState, useEffect } from 'react';
import * as H from 'history';
import { Loader } from 'semantic-ui-react';

import SessionView from '../includes/SessionView';
import CalendarView from '../includes/CalendarView';
import NotificationModal from '../includes/NotificationModal';
import LeaveQueue from '../includes/LeaveQueue';

import { useCourse, useSession, useMyUser } from '../../firehooks';
import { firestore } from '../../firebase';
import { removeQuestionbyID } from '../../firebasefunctions/sessionQuestion';
import TopBar from '../includes/TopBar';
import CalendarExportModal from '../includes/CalendarExportModal';

// Also update in the main LESS file
const MOBILE_BREAKPOINT = 920;

const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        const handleCloseWindowAlert = (ev: BeforeUnloadEvent) => {
            ev.preventDefault();
            ev.returnValue = 'Are you sure you want to close?';
            return ev.returnValue;
        };

        window.addEventListener('beforeunload', handleCloseWindowAlert);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('beforeunload', handleCloseWindowAlert);
        };
    });

    return width;
};

const SplitView = (props: {
    history: H.History;
    match: {
        params: {
            courseId: string;
            sessionId: string | undefined;
            page: string | null;
        };
    };
}) => {
    const [activeView, setActiveView] = useState(
        props.match.params.page === 'add'
            ? 'addQuestion'
            : props.match.params.sessionId
                ? 'session'
                : 'calendar'
    );
    const [showModal, setShowModal] = useState(false);
    const [removeQuestionId, setRemoveQuestionId] = useState<
    string | undefined
    >(undefined);
    const [showCalendarModal, setShowCalendarModal] = useState(false);

    const user = useMyUser();
    const course = useCourse(props.match.params.courseId);
    const session = useSession(props.match.params.sessionId);
    const width = useWindowWidth();

    // Handle browser back button
    props.history.listen((location) => {
        setActiveView(
            location.pathname.indexOf('add') !== -1
                ? 'addQuestion'
                : props.match.params.sessionId
                    ? 'session'
                    : 'calendar'
        );
    });

    // Keep track of active view for mobile
    const handleSessionClick = (newSessionId: string) => {
        props.history.push(
            '/course/' +
                props.match.params.courseId +
                '/session/' +
                newSessionId
        );
        setActiveView('session');
    };

    const handleJoinClick = () => {
        if (session) {
            props.history.push(
                '/course/' +
                    props.match.params.courseId +
                    '/session/' +
                    session.sessionId +
                    '/add'
            );
            setActiveView('addQuestion');
        }
    };

    const handleBackClick = () => {
        props.history.push('/course/' + props.match.params.courseId);
        setActiveView('calendar');
    };

    const removeQuestion = () => {
        removeQuestionbyID(firestore, removeQuestionId);
    };

    return (
        <>
            <LeaveQueue
                setShowModal={setShowModal}
                showModal={showModal}
                removeQuestion={removeQuestion}
            />
            <TopBar
                user={user}
                role={
                    (user && course && user.roles[course.courseId]) || 'student'
                }
                context='student'
                courseId={props.match.params.courseId}
                course={course}
            />
            {(width > MOBILE_BREAKPOINT || activeView === 'calendar') && (
                <CalendarView
                    course={course}
                    user={user}
                    session={session}
                    sessionCallback={handleSessionClick}
                    setShowCalendarModal={setShowCalendarModal}
                />
            )}

            {'Notification' in window &&
                window?.Notification.permission !== 'granted' && (
                <NotificationModal show={activeView !== 'session'} />
            )}

            <CalendarExportModal
                showCalendarModal={showCalendarModal}
                setShowCalendarModal={setShowCalendarModal}
            />

            {(width > MOBILE_BREAKPOINT || activeView !== 'calendar') &&
                (course && user ? (
                    session ? (
                        <SessionView
                            course={course}
                            session={session}
                            user={user}
                            isDesktop={width > MOBILE_BREAKPOINT}
                            backCallback={handleBackClick}
                            joinCallback={handleJoinClick}
                            setShowModal={setShowModal}
                            setRemoveQuestionId={setRemoveQuestionId}
                        />
                    ) : (
                        <section className='StudentSessionView'>
                            <p className='welcomeMessage'>
                                Welcome{user && ', '}
                                <span className='welcomeName'>
                                    {user && user.firstName}
                                </span>
                            </p>
                            <p className='noSessionSelected'>
                                Please select an office hour from the calendar.
                                <p> </p>
                                <p> </p>
                                {'Notification' in window &&
                                    window?.Notification !== undefined &&
                                    window?.Notification.permission ===
                                        'granted' && (
                                    <div className='warningArea'>
                                        <div>&#9888;</div>
                                        <div>
                                                Please make sure to enable
                                                browser notifications in your
                                                system settings.
                                        </div>
                                    </div>
                                )}
                            </p>
                        </section>
                    )
                ) : (
                    <Loader active={true} content='Loading' />
                ))}
        </>
    );
};

export default SplitView;
