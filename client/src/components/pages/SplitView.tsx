import * as React from 'react';
import { useState, useEffect } from 'react';
import * as H from 'history';

import SessionView from '../includes/SessionView';
import CalendarView from '../includes/CalendarView';
import AddQuestion from '../includes/AddQuestion';

import { firestore, loggedIn$ } from '../../firebase';
import { docData, collectionData } from 'rxfire/firestore';
import { switchMap } from 'rxjs/operators';
import { useCourse, useSession } from '../../firehooks';

import TopBar from '../includes/TopBar';
import { Loader } from 'semantic-ui-react';

// Also update in the main LESS file
const MOBILE_BREAKPOINT = 920;

const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });

    return width;
};

const SplitView = (props: {
    history: H.History,
    match: {
        params: {
            courseId: string,
            sessionId: string | undefined,
            page: string | null
        }
    }
}) => {
    // @ts-ignore idk
    let sessionView: SessionView | null = null;

    const [activeView, setActiveView] = useState(
        props.match.params.page === 'add'
            ? 'addQuestion'
            : props.match.params.sessionId ? 'session' : 'calendar'
    );

    const [courseUser, setCourseUser] = useState<FireCourseUser | undefined>(undefined);
    const [user, setUser] = useState<FireUser | undefined>(undefined);
    const course = useCourse(props.match.params.courseId);
    const session = useSession(props.match.params.sessionId);
    const width = useWindowWidth();

    // // Get current course user based on courseId and user
    useEffect(
        () => {
            loggedIn$.pipe(
                switchMap(u => collectionData(
                    firestore
                        .collection('courseUsers')
                        .where('userId', '==', firestore.doc('users/' + u.uid))
                        .where('courseId', '==', firestore.doc('courses/' + props.match.params.courseId)),
                    'courseId'
                ))
                // RYAN_TODO better handle unexpected case w/ no courseUser
            ).subscribe((courseUsers: FireCourseUser[]) => setCourseUser(courseUsers[0]));

            // Get current user object
            loggedIn$.pipe(
                switchMap(u => docData(firestore.doc('users/' + u.uid), 'userId'))
            ).subscribe((u: FireUser) => setUser(u));
            return () => {
                console.log('clear');
            };
        },
        []
    );

    // Handle browser back button
    props.history.listen((location, action) => {
        setActiveView(
            location.pathname.indexOf('add') !== -1
                ? 'addQuestion'
                : props.match.params.sessionId ? 'session' : 'calendar'
        );
        // setSessionId(props.match.params.sessionId);
    });

    // Keep track of active view for mobile
    const handleSessionClick = (newSessionId: string) => {
        props.history.push('/course/' + props.match.params.courseId + '/session/' + newSessionId);
        // setSessionId(newSessionId);
        setActiveView('session');
    };

    const handleJoinClick = () => {
        if (session) {
            props.history.push(
                '/course/' + props.match.params.courseId + '/session/' + session.sessionId + '/add'
            );
            setActiveView('addQuestion');
        }
    };

    const handleBackClick = () => {
        props.history.push('/course/' + props.match.params.courseId);
        // setSessionId(undefined);
        setActiveView('calendar');
    };

    // Toggle warning

    return (
        <React.Fragment>
            {(width > MOBILE_BREAKPOINT || activeView === 'calendar') &&
                <CalendarView
                    course={course}
                    courseUser={courseUser}
                    session={session}
                    sessionCallback={handleSessionClick}
                />
            }{(width > MOBILE_BREAKPOINT || activeView !== 'calendar') &&
                (session && course && user && courseUser ?
                    <SessionView
                        course={course}
                        courseUser={courseUser}
                        session={session}
                        user={user}
                        isDesktop={width > MOBILE_BREAKPOINT}
                        backCallback={handleBackClick}
                        joinCallback={handleJoinClick}
                        ref={(ref) => sessionView = ref}
                    />
                    : <section className="StudentSessionView">
                        {user && <TopBar
                            user={user}
                            role={courseUser ? courseUser.role : 'student'}
                            context="student"
                            courseId={props.match.params.courseId}
                        />}
                        <p className="welcomeMessage">
                            Welcome{user && ', '}
                            <span className="welcomeName">
                                {user && user.firstName}
                            </span>
                        </p>
                        <p className="noSessionSelected">
                            Please select an office hour from the calendar.
                        </p>
                    </section>
                )}
            {activeView === 'addQuestion' && <>
                <div className="modal">
                    {course && session
                        ? <AddQuestion session={session} course={course} mobileBreakpoint={MOBILE_BREAKPOINT} />
                        : <Loader active={true} content={'Loading'} />
                    }
                </div>
                <div className="modalShade" onClick={() => setActiveView('session')} />
            </>}
        </React.Fragment>
    );
};

export default SplitView;
