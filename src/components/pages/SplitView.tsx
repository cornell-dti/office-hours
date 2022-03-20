import React, { useState, useEffect } from 'react';
import * as H from 'history';
import { Loader } from 'semantic-ui-react';

import { connect } from 'react-redux';
import SessionView from '../includes/SessionView';
import CalendarView from '../includes/CalendarView';
import LeaveQueue from '../includes/LeaveQueue';
import ProductUpdates from "../includes/ProductUpdates"

import { useCourse, useSession } from '../../firehooks';
import { firestore } from '../../firebase';
import { removeQuestionbyID } from '../../firebasefunctions/sessionQuestion';
import TopBar from '../includes/TopBar';
import CalendarExportModal from '../includes/CalendarExportModal';
import { RootState } from '../../redux/store';
import {updateCourse, updateSession} from "../../redux/actions/course";
import Browser from '../../media/browser.svg';
import smsNotif from '../../media/smsNotif.svg'
import { addBanner } from '../../redux/actions/announcements';
import Banner from '../includes/Banner';
import { updateTextPrompted } from '../../firebasefunctions/phoneNumber';

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

type SplitViewProps = {
    history: H.History;
    match: {
        params: {
            courseId: string;
            sessionId: string | undefined;
            page: string | null;
        };
    };
    user: FireUser | undefined;
    course: FireCourse;
    session: FireSession;
    updateCourse: (user: FireCourse | undefined) => Promise<void>;
    updateSession: (user: FireSession | undefined) => Promise<void>;
    addBanner: (banner: Announcement) => Promise<void>;
    banners: Announcement[];
}

const SplitView = ({
    history, 
    match, 
    user, 
    course, 
    session, 
    updateCourse, 
    updateSession, 
    addBanner, 
    banners
}: SplitViewProps) => {
    const [activeView, setActiveView] = useState(
        match.params.page === 'add'
            ? 'addQuestion'
            : match.params.sessionId ? 'session' : 'calendar'
    );
    const [showModal, setShowModal] = useState(false);
    const [removeQuestionId, setRemoveQuestionId] = useState<
    string | undefined
    >(undefined);
    const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
    const [currentExportSession, setCurrentExportSession] =
        useState<FireSession>({
            modality: 'virtual',
            courseId: '',
            endTime: { seconds: 0, nanoseconds: 0, toDate: () => new Date() },
            startTime: { seconds: 0, nanoseconds: 0, toDate: () => new Date() },
            tas: [],
            title: '',
            sessionId: '',
            totalQuestions: 0,
            assignedQuestions: 0,
            resolvedQuestions: 0,
            totalWaitTime: 0,
            totalResolveTime: 0,
        });

    const courseHook = useCourse(match.params.courseId);
    const sessionHook = useSession(match.params.sessionId);
    const width = useWindowWidth();

    useEffect(() => {
        updateCourse(courseHook);
    }, [courseHook, updateCourse])
    useEffect(() => {
        updateSession(sessionHook);
    }, [sessionHook, updateSession])
    
    // Handle browser back button
    history.listen((location) => {
        setActiveView(
            location.pathname.indexOf('add') !== -1
                ? 'addQuestion'
                : match.params.sessionId ? 'session' : 'calendar'
        );
    });

    // Keep track of active view for mobile
    const handleSessionClick = (newSessionId: string) => {
        history.push('/course/' + match.params.courseId + '/session/' + newSessionId);
        setActiveView('session');
    };

    const handleJoinClick = () => {
        if (session) {
            history.push(
                '/course/' + match.params.courseId + '/session/' + session.sessionId + '/add'
            );
            setActiveView('addQuestion');
        }
    };

    const handleBackClick = () => {
        history.push('/course/' + match.params.courseId);
        setActiveView('calendar');
    };

    const removeQuestion = () => {
        removeQuestionbyID(firestore, removeQuestionId);
    };

    useEffect(() => {
        // Add a banner prompting the user to enable browser notifications
        if("Notification" in window && Notification.permission === 'default') {
            addBanner({text: "Enable browser notifications to receive notification updates.", icon: Browser});
        };
        try {
            // Request permission to send desktop notifications
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        } catch (error) {
            // Do nothing. iOS crashes because Notification isn't defined
        }
        if(!user?.textPrompted) {
            addBanner({text: "Enable text notifications to know when your question is up.", icon: smsNotif});
            updateTextPrompted(user?.userId);
        }
    }, [addBanner, user])

    return (
        <>
            <LeaveQueue
                setShowModal={setShowModal}
                showModal={showModal}
                removeQuestion={removeQuestion}
            />
            <TopBar
                role={(user && course && user.roles[course.courseId]) || 'student'}
                context="student"
                courseId={match.params.courseId}
                course={course}
            />
            {banners.map(banner => (<Banner icon={banner.icon} announcement={banner.text}  />))}
            {(width > MOBILE_BREAKPOINT || activeView === 'calendar') && (
                <CalendarView
                    course={course}
                    session={session}
                    sessionCallback={handleSessionClick}
                    isActiveSession={match.params.sessionId === session?.sessionId}
                    setShowCalendarModal={setShowCalendarModal}
                    setCurrentExportSession={setCurrentExportSession}
                />)}

            <CalendarExportModal
                showCalendarModal={showCalendarModal}
                setShowCalendarModal={setShowCalendarModal}
                currentExportSession={currentExportSession}
                course={course}
            />

            {(width > MOBILE_BREAKPOINT || activeView !== 'calendar') &&
                ((course && user) ? (
                    (session) ? (
                        <SessionView
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
                ) : <Loader active={true} content="Loading" />)}
            <ProductUpdates />
           
        </>
    );
};
const mapStateToProps = (state: RootState) => ({
    user : state.auth.user,
    course : state.course.course,
    session: state.course.session,
    banners: state.announcements.banners
})


export default connect(mapStateToProps, {updateCourse, updateSession, addBanner})(SplitView);
