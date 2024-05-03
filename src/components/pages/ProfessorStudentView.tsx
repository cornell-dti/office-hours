import React, { useEffect, useState } from "react";
import * as H from "history";
import { connect } from "react-redux";
import { Loader } from "semantic-ui-react";
import ProfessorSidebar from "../includes/ProfessorSidebar";
import TopBar from "../includes/TopBar";
import LeaveQueue from "../includes/LeaveQueue";

import { useCourse, useSession } from "../../firehooks";
import { firestore } from "../../firebase";
import { removeQuestionbyID, submitFeedback } from "../../firebasefunctions/sessionQuestion";
import CalendarExportModal from "../includes/CalendarExportModal";
import CalendarView from "../includes/CalendarView";
import { RootState } from "../../redux/store";
import FeedbackPrompt from "../includes/FeedbackPrompt";
import ProductUpdates from "../includes/ProductUpdates";
import SessionView from "../includes/SessionView";
import { updateCourse, updateSession } from "../../redux/actions/course";

const MOBILE_BREAKPOINT = 920;

const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        const handleCloseWindowAlert = (ev: BeforeUnloadEvent) => {
            ev.preventDefault();
            ev.returnValue = "Are you sure you want to close?";
            return ev.returnValue;
        };

        window.addEventListener("beforeunload", handleCloseWindowAlert);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("beforeunload", handleCloseWindowAlert);
        };
    });

    return width;
};

type ProfessorStudentViewProps = {
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
};

const ProfessorStudentView = ({
    history,
    match,
    user,
    course,
    session,
    updateCourse,
    updateSession,
}: ProfessorStudentViewProps) => {
    const [activeView, setActiveView] = useState(
        match.params.page === "add" ? "addQuestion" : match.params.sessionId ? "session" : "calendar"
    );
    const [showModal, setShowModal] = useState(false);

    const [removeQuestionId, setRemoveQuestionId] = useState<string | undefined>(undefined);
    const [displayFeedbackPrompt, setDisplayFeedbackPrompt] = useState<boolean>(false);
    const [removedQuestionId, setRemovedQuestionId] = useState<string | undefined>(undefined);
    const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
    const [isDayExport, setIsDayExport] = useState<boolean>(false);
    const [currentExportSessions, setCurrentExportSessions] = useState<FireSession[]>([
        {
            modality: "virtual",
            courseId: "",
            endTime: { seconds: 0, nanoseconds: 0, toDate: () => new Date() },
            startTime: { seconds: 0, nanoseconds: 0, toDate: () => new Date() },
            tas: [],
            title: "",
            sessionId: "",
            totalQuestions: 0,
            assignedQuestions: 0,
            resolvedQuestions: 0,
            totalWaitTime: 0,
            totalResolveTime: 0,
            isPaused: false,
        },
    ]);

    const courseHook = useCourse(match.params.courseId);
    const sessionHook = useSession(match.params.sessionId);
    const width = useWindowWidth();

    useEffect(() => {
        updateCourse(courseHook);
    }, [courseHook, updateCourse]);
    useEffect(() => {
        updateSession(sessionHook);
    }, [sessionHook, updateSession]);

    // Handle browser back button
    history.listen((location) => {
        setActiveView(
            location.pathname.indexOf("add") !== -1 ? "addQuestion" : match.params.sessionId ? "session" : "calendar"
        );
    });

    // Keep track of active view for mobile
    const handleSessionClick = (newSessionId: string) => {
        history.push("/professor-student-view/course/" + match.params.courseId + "/session/" + newSessionId);
        setActiveView("session");
    };

    const handleJoinClick = () => {
        if (session) {
            history.push(
                "/professor-student-view/course/" + match.params.courseId + "/session/" + session.sessionId + "/add"
            );
            setActiveView("addQuestion");
        }
    };

    const handleBackClick = () => {
        history.push("/professor-student-view/course/" + match.params.courseId);
        setActiveView("calendar");
    };

    const removeQuestion = () => {
        removeQuestionbyID(firestore, removeQuestionId);
    };

    // used to display feedback
    const removeQuestionDisplayFeedback = (questionId: string | undefined) => {
        setRemoveQuestionId(questionId);
        setDisplayFeedbackPrompt(true);
        setRemovedQuestionId(questionId);
        // eslint-disable-next-line no-console
        console.log("professor student view questionId: ", questionId);
    };

    return (
        <div className="ProfessorView">
            <ProfessorSidebar
                courseId={match.params.courseId}
                code={(course && course.code) || "Loading"}
                selected={"student"}
            />
            <TopBar courseId={match.params.courseId} context="professor" role="professor" />
            <section className="rightOfSidebar">
                <LeaveQueue setShowModal={setShowModal} showModal={showModal} removeQuestion={removeQuestion} />
                {(width > MOBILE_BREAKPOINT || activeView === "calendar") && (
                    <CalendarView
                        course={course}
                        session={session}
                        sessionCallback={handleSessionClick}
                        isActiveSession={match.params.sessionId === session?.sessionId}
                        setShowCalendarModal={setShowCalendarModal}
                        setIsDayExport={setIsDayExport}
                        setCurrentExportSessions={setCurrentExportSessions}
                    />
                )}
                <CalendarExportModal
                    showCalendarModal={showCalendarModal}
                    setShowCalendarModal={setShowCalendarModal}
                    isDayExport={isDayExport}
                    currentExportSessions={currentExportSessions}
                    course={course}
                />
                {(width > MOBILE_BREAKPOINT || activeView !== "calendar") &&
                    (course && user ? (
                        session ? (
                            <SessionView
                                isDesktop={width > MOBILE_BREAKPOINT}
                                backCallback={handleBackClick}
                                joinCallback={handleJoinClick}
                                setShowModal={setShowModal}
                                setRemoveQuestionId={setRemoveQuestionId}
                                removeQuestionDisplayFeedback={removeQuestionDisplayFeedback}
                                timeWarning={course ? course.timeWarning : 1}
                                showProfessorStudentView={true}
                            />
                        ) : (
                            <section className="StudentSessionView">
                                <p className="welcomeMessage">
                                    Welcome{user && ", "}
                                    <span className="welcomeName">{user && user.firstName}</span>
                                </p>
                                <div className="noSessionSelected">
                                    Please select an office hour from the calendar.
                                    <span>{"\n"}</span>
                                    {"Notification" in window &&
                                        window?.Notification !== undefined &&
                                        window?.Notification.permission !== "granted" && (
                                        <div className="warningArea">
                                            <div>&#9888;</div>
                                            <div>
                                                    Please make sure to enable browser notifications in your system
                                                    settings.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )
                    ) : (
                        <Loader active={true} content="Loading" />
                    ))}
                <ProductUpdates />
                {displayFeedbackPrompt ? (
                    <FeedbackPrompt
                        onClose={submitFeedback(removedQuestionId, course, session.sessionId)}
                        closeFeedbackPrompt={() => setDisplayFeedbackPrompt(false)}
                    />
                ) : null}
            </section>
        </div>
    );
};

const mapStateToProps = (state: RootState) => ({
    user: state.auth.user,
    course: state.course.course,
    session: state.course.session,
});

export default connect(mapStateToProps, { updateCourse, updateSession })(ProfessorStudentView);
