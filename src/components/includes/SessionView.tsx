import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "semantic-ui-react";

import { connect } from "react-redux";
import { onSnapshot, where, query, collection} from 'firebase/firestore';
import SessionInformationHeader from "./SessionInformationHeader";
import SessionQuestionsContainer from "./SessionQuestionsContainer";

import {
    useCourseTags,
    useCourseUsersMap,
    useSessionQuestions,
    useSessionProfile,
    useAskerQuestions,
} from "../../firehooks";
import { updateQuestion, updateVirtualLocation } from "../../firebasefunctions/sessionQuestion";
import { filterUnresolvedQuestions } from "../../utilities/questions";

import { firestore } from "../../firebase";

import { RootState } from "../../redux/store";
import Banner from "./Banner";
import TaAnnouncements from "./TaAnnouncements";

type Props = {
    course: FireCourse;
    session: FireSession;
    questions: readonly FireQuestion[];
    isDesktop: boolean;
    backCallback: () => void;
    joinCallback: () => void;
    user: FireUser;
    setShowModal: (show: boolean) => void;
    setRemoveQuestionId: (newId: string | undefined) => void; // when user removes their own question
    removeQuestionDisplayFeedback: (newId: string | undefined) => void; // when question is finished
    sessionBanners: Announcement[];
    timeWarning: number | undefined;
    showProfessorStudentView: boolean;
};

type UndoState = {
    undoAction?: string;
    undoName?: string;
    undoQuestionId?: string;
    timeoutId: NodeJS.Timeout | null;
};

type AbsentState = {
    showAbsent: boolean;
    dismissedAbsent: boolean;
    lastAskedQuestion: FireQuestion | null;
};

const SessionView = ({
    course,
    session,
    questions,
    isDesktop,
    backCallback,
    joinCallback,
    user,
    setShowModal,
    setRemoveQuestionId,
    removeQuestionDisplayFeedback,
    timeWarning,
    sessionBanners,
    showProfessorStudentView,
}: Props) => {
    // make user appear as not a ta/prof if showProfessorStudentView is true
    const isTa = showProfessorStudentView ? false : user.roles[course.courseId] !== undefined;
    const isProf = showProfessorStudentView ? false : user.roles[course.courseId] === "professor";
    const tags = useCourseTags(course.courseId);
    const users = useCourseUsersMap(course.courseId, isTa);
    const [{ undoAction, undoName, undoQuestionId, timeoutId }, setUndoState] = useState<UndoState>({
        timeoutId: null,
    });
    const [, setAbsentState] = useState<AbsentState>({
        showAbsent: true,
        dismissedAbsent: true,
        lastAskedQuestion: null,
    });

    const sessionProfile = useSessionProfile(isTa ? user.userId : undefined, isTa ? session.sessionId : undefined);

    const updateSessionProfile = useCallback(
        (virtualLocation: string) => {
            updateQuestion(firestore, virtualLocation, questions, user);
        },
        [questions, user]
    );

    useEffect(() => {
        const myQuestions = questions.filter((q) => q.askerId === user.userId);
        const lastAskedQuestion =
            myQuestions.length > 0
                ? myQuestions.reduce((prev, current) =>
                    prev.timeEntered.toDate() > current.timeEntered.toDate() ? prev : current
                )
                : null;

        setAbsentState((currentState) => {
            let showAbsent = currentState.showAbsent;
            let dismissedAbsent = currentState.dismissedAbsent;
            if (lastAskedQuestion !== null && lastAskedQuestion.status !== "no-show") {
                if (currentState.showAbsent) {
                    showAbsent = false;
                    dismissedAbsent = true;
                } else if (currentState.dismissedAbsent) {
                    showAbsent = true;
                    dismissedAbsent = false;
                }
            }
            return { lastAskedQuestion, showAbsent, dismissedAbsent };
        });
        // setPrevQuestSet(new Set(questions.map(q => q.questionId)));
    }, [questions, user.userId, course.courseId, user.roles, user, session.sessionId]);

    /** This useEffect dictates when the TA feedback popup is displayed by monitoring the
     * state of the current question. Firebase's [onSnapshot] method is used to monitor any
     * changes to the questions collection, and [docChanges] filters this down to the document
     * changes since the last snapshot. Then, we call [removeQuestionDisplayFeedback] iff a question was
     * both modified and resolved, indicating that the TA has answered a question. !isTa and
     * !isProf ensures that this useEffect only runs for students.
     */
    // TODO (richardgu): use a Firebase Cloud Function for a server-side trigger in the future
    useEffect(() => {
        let unsubscribe: () => void;

        if (!isTa && !isProf) {
            const questionsRef = query(collection(firestore, 'questions'), where("sessionId", "==", session.sessionId));
            unsubscribe = onSnapshot(questionsRef, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    const questionData = change.doc.data();
                    const questionId = change.doc.id;

                    if (change.type === "modified" && questionData.status === "resolved") {
                        // eslint-disable-next-line no-console
                        removeQuestionDisplayFeedback(questionId);
                    }
                });
            });
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const dismissUndo = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setUndoState({
            undoAction: undefined,
            undoName: undefined,
            undoQuestionId: undefined,
            timeoutId: null,
        });
    };

    const triggerUndo = (questionId: string, action: string, name: string) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setUndoState({
            undoQuestionId: questionId,
            undoAction: action,
            undoName: name,
            timeoutId: setTimeout(dismissUndo, 10000),
        });
    };

    const isOpen = (s: FireSession, interval: number): boolean => {
        const intervalInMilliseconds = interval * 1000 * 60;
        return (
            s.startTime.toDate().getTime() - intervalInMilliseconds < new Date().getTime() &&
            s.endTime.toDate().getTime() > new Date().getTime()
        );
    };

    const isPast = (s: FireSession): boolean => new Date() > new Date(s.endTime.toDate());

    const getOpeningTime = (s: FireSession, interval: number): Date =>
        new Date(new Date(s.startTime.toDate()).getTime() - interval * 1000 * 60);

    let undoText = "";
    if (undoAction) {
        if (undoAction === "resolved") {
            undoText = undoName + " has been resolved! ";
        } else if (undoAction === "no-show") {
            undoText = undoName + " has been marked as a no-show. ";
        } else if (undoAction === "retracted") {
            undoText = "You have removed your question. ";
        } else if (undoAction === "assigned") {
            undoText = undoName + " has been assigned to you! ";
        }
    }

    // First check that the session is not ended yet.
    const haveAnotherQuestion =
        new Date(session.endTime.toDate()) >= new Date() &&
        questions.some(({ askerId, status }) => askerId === user.userId && status === "unresolved");

    const myQuestions = useAskerQuestions(session.sessionId, user.userId);
    const assignedQuestion = myQuestions?.filter((q) => q.status === "assigned")[0];

    const myQuestion = React.useMemo(() => {
        if (myQuestions && myQuestions.length > 0) {
            return (
                myQuestions
                    .sort((a, b) => a.timeEntered.seconds - b.timeEntered.seconds)
                    .find((q) => q.status === "unresolved" || q.status === "assigned") || null
            );
        }

        return null;
    }, [myQuestions]);

    return (
        <section className="StudentSessionView">
            {sessionBanners.map((banner, index) => (
                <Banner key={index} icon={banner.icon} announcement={banner.text} />
            ))}
            <SessionInformationHeader
                session={session}
                course={course}
                callback={backCallback}
                isDesktop={isDesktop}
                isTa={isTa}
                virtualLocation={sessionProfile?.virtualLocation}
                assignedQuestion={assignedQuestion}
                isOpen={isOpen(session, course.queueOpenInterval)}
                myQuestion={myQuestion}
                onUpdate={(virtualLocation) => {
                    updateVirtualLocation(firestore, user, session, virtualLocation);
                    updateSessionProfile(virtualLocation);
                }}
                questions={questions.filter((q) => q.status === "unresolved")}
                isPaused={session.isPaused}
            />

            <TaAnnouncements showProfessorStudentView={showProfessorStudentView} />

            {undoQuestionId && (
                <div className="undoContainer">
                    <p className="undoClose" onClick={dismissUndo}>
                        <Icon name="close" />
                    </p>
                    <p className="undoText">
                        {undoText}
                        <span className="undoLink">Undo</span>
                    </p>
                </div>
            )}
            {/* FUTURE_TODO - Just pass in the session and not a bunch of bools */}
            <SessionQuestionsContainer
                session={session}
                isTA={isTa}
                isProf={isProf}
                modality={session.modality}
                myVirtualLocation={(sessionProfile && sessionProfile.virtualLocation) || undefined}
                questions={
                    session.modality === "review"
                        ? questions.filter((q) => q.status !== "retracted")
                        : questions
                            .filter((q) => q.status === "unresolved" || q.status === "assigned")
                            .sort((a, b) => (a.timeEntered > b.timeEntered ? 1 : -1))
                }
                users={users}
                tags={tags}
                handleJoinClick={joinCallback}
                myUserId={user.userId}
                triggerUndo={triggerUndo}
                isOpen={isOpen(session, course.queueOpenInterval)}
                isPast={isPast(session)}
                isPaused={session.isPaused}
                openingTime={getOpeningTime(session, course.queueOpenInterval)}
                haveAnotherQuestion={haveAnotherQuestion}
                course={course}
                myQuestion={myQuestion}
                setShowModal={setShowModal}
                timeWarning={timeWarning}
                showProfessorStudentView={showProfessorStudentView}
                setRemoveQuestionId={setRemoveQuestionId}
            />
        </section>
    );
};

const mapStateToProps = (state: RootState) => ({
    user: state.auth.user,
    course: state.course.course,
    session: state.course.session,
    sessionBanners: state.announcements.sessionBanners,
});

export default connect(
    mapStateToProps,
    {}
)((props: Omit<Props, "questions">) => {
    const isTa = props.user.roles[props.course.courseId] !== undefined;
    const questions =
        props.session.modality === "review"
            ? useSessionQuestions(props.session.sessionId, true)
            : filterUnresolvedQuestions(useSessionQuestions(props.session.sessionId, isTa));
    return <SessionView questions={questions} {...props} />;
});
