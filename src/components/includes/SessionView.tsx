import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from 'semantic-ui-react';
// import addNotification from 'react-push-notification';

import { connect } from 'react-redux';
import SessionInformationHeader from './SessionInformationHeader';
import SessionQuestionsContainer from './SessionQuestionsContainer';

import {
    useCourseTags, useCourseUsersMap, useSessionQuestions, useSessionProfile,
    useAskerQuestions
} from '../../firehooks';
import { updateQuestion, updateVirtualLocation } from '../../firebasefunctions/sessionQuestion'
// import { addDBNotification } from '../../firebasefunctions/notifications'
import { filterUnresolvedQuestions } from '../../utilities/questions';

import { firestore } from '../../firebase';

import { RootState } from '../../redux/store';
import Browser from '../../media/browser.svg';


type Props = {
    course: FireCourse;
    session: FireSession;
    questions: readonly FireQuestion[];
    isDesktop: boolean;
    backCallback: Function;
    joinCallback: Function;
    user: FireUser;
    setShowModal: (show: boolean) => void;
    setRemoveQuestionId: (newId: string | undefined) => void;
};

type UndoState = {
    undoAction?: string;
    undoName?: string;
    undoQuestionId?: number;
    timeoutId: NodeJS.Timeout | null;
};

type AbsentState = {
    showAbsent: boolean;
    dismissedAbsent: boolean;
    lastAskedQuestion: FireQuestion | null;
};

const SessionView = (
    { course, session, questions, isDesktop, backCallback, joinCallback, user, setShowModal,
        setRemoveQuestionId }: Props
) => {
    const isTa = user.roles[course.courseId] !== undefined;
    const tags = useCourseTags(course.courseId);
    const users = useCourseUsersMap(course.courseId, isTa);

    const [
        { undoAction, undoName, undoQuestionId, timeoutId },
        setUndoState
    ] = useState<UndoState>({ timeoutId: null });
    const [, setAbsentState] = useState<AbsentState>({
        showAbsent: true,
        dismissedAbsent: true,
        lastAskedQuestion: null
    });

    // const [prevQuestSet, setPrevQuestSet] = useState(new Set(questions.map(q => q.questionId)));
    const [showNotifBanner, setShowNotifBanner] = useState(true);

    const sessionProfile = useSessionProfile(isTa ? user.userId : undefined, isTa ? session.sessionId : undefined);

    const updateSessionProfile = useCallback((virtualLocation: string) => {
        updateQuestion(firestore, virtualLocation, questions, user)
    }, [questions, user]);

    useEffect(() => {
        // const questionIds = questions.map(q => q.questionId);

        // const newQuestions = new Set(questionIds.filter(q => !prevQuestSet.has(q)));

        // if (newQuestions.size <= 0) {
        //     return;
        // }
        // if ((user.roles[course.courseId] === 'professor' ||
        //     user.roles[course.courseId] === 'ta') && 
        //      window.localStorage.getItem("prevSession") === session.sessionId) {
        //     const prevQString = window.localStorage.getItem("prevQuestions");
        //     const prevQArr = JSON.parse(prevQString || "{}");
        //     const prevQSet = new Set(Array.from(prevQArr))
        //     const newQuestionsPessimistic = new Set(questionIds.filter(q => !prevQSet.has(q)))
        //     if (newQuestionsPessimistic.size > 0) {
        //         addDBNotification(
        //             user,
        //             {
        //                 title: 'A new question has been added!',
        //                 subtitle: 'A new question was added',
        //                 message: "Check the queue."
        //             }
        //         )
        //         try {
        //             addNotification({
        //                 title: 'A new question has been added!',
        //                 subtitle: 'A new question was added',
        //                 message: 'Check the queue.',
        //                 native: true
        //             });
        //         } catch (error) {
        //             // TODO: Handle this better.
        //             // Do nothing. iOS crashes because Notification isn't defined
        //         }
        //     }
        //     window.localStorage.setItem("prevQuestions", JSON.stringify(questionIds));
        // }

        // window.localStorage.setItem("prevSession", session.sessionId);

        const myQuestions = questions.filter(q => q.askerId === user.userId);
        const lastAskedQuestion = myQuestions.length > 0
            ? myQuestions.reduce(
                (prev, current) => prev.timeEntered.toDate() > current.timeEntered.toDate() ? prev : current
            )
            : null;

        setAbsentState(currentState => {
            let showAbsent = currentState.showAbsent;
            let dismissedAbsent = currentState.dismissedAbsent;
            if (lastAskedQuestion !== null && lastAskedQuestion.status !== 'no-show') {
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
    }, [ questions, user.userId, course.courseId, user.roles, user, session.sessionId]);

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

    const triggerUndo = (questionId: number, action: string, name: string) => {
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
        return s.startTime.toDate().getTime() - intervalInMilliseconds < new Date().getTime()
            && s.endTime.toDate().getTime() > new Date().getTime();
    };

    const isPast = (s: FireSession): boolean => new Date() > new Date(s.endTime.toDate());

    const getOpeningTime = (s: FireSession, interval: number): Date => (
        new Date(new Date(s.startTime.toDate()).getTime() - interval * 1000 * 60)
    );

    let undoText = '';
    if (undoAction) {
        if (undoAction === 'resolved') {
            undoText = undoName + ' has been resolved! ';
        } else if (undoAction === 'no-show') {
            undoText = undoName + ' has been marked as a no-show. ';
        } else if (undoAction === 'retracted') {
            undoText = 'You have removed your question. ';
        } else if (undoAction === 'assigned') {
            undoText = undoName + ' has been assigned to you! ';
        }
    }


    // First check that the session is not ended yet.
    const haveAnotherQuestion = new Date(session.endTime.toDate()) >= new Date()
        && questions.some(({ askerId, status }) => askerId === user.userId && status === 'unresolved');

    const myQuestions = useAskerQuestions(session.sessionId, user.userId);
    const assignedQuestion = myQuestions?.filter(q => q.status === 'assigned')[0];

    const myQuestion = React.useMemo(() => {
        if (myQuestions && myQuestions.length > 0) {
            return myQuestions
                .sort((a, b) => a.timeEntered.seconds - b.timeEntered.seconds)
                .find(q => q.status === 'unresolved' || q.status === 'assigned') || null;
        }

        return null;
    }, [myQuestions]);

    return (
        <section className="StudentSessionView">
            {"Notification" in window &&
                window?.Notification.permission !== "granted" && showNotifBanner === true &&
                <div className="SessionNotification">
                    <img src={Browser} alt="Browser" />
                    <div className="label">Enable browser notifications to know when it's your turn.</div>
                    <div className="button" onClick={() => setShowNotifBanner(false)}>
                        GOT IT
                    </div>
                </div>
            }
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
            />

            {undoQuestionId &&
                <div className="undoContainer">
                    <p className="undoClose" onClick={dismissUndo}>
                        <Icon name="close" />
                    </p>
                    <p className="undoText">
                        {undoText}
                        <span
                            className="undoLink"
                        >
                            Undo
                        </span>
                    </p>
                </div>
            }
            {/* FUTURE_TODO - Just pass in the session and not a bunch of bools */}
            <SessionQuestionsContainer
                session={session}
                isTA={isTa}
                modality={session.modality}
                myVirtualLocation={(sessionProfile && sessionProfile.virtualLocation) || undefined}
                questions={session.modality === 'review' ? questions.filter(q => q.status !== 'retracted') :
                    questions.filter(q => q.status === 'unresolved' || q.status === 'assigned')}
                users={users}
                tags={tags}
                handleJoinClick={joinCallback}
                myUserId={user.userId}
                triggerUndo={triggerUndo}
                isOpen={isOpen(session, course.queueOpenInterval)}
                isPast={isPast(session)}
                openingTime={getOpeningTime(session, course.queueOpenInterval)}
                haveAnotherQuestion={haveAnotherQuestion}
                course={course}
                myQuestion={myQuestion}
                setShowModal={setShowModal}
                setRemoveQuestionId={setRemoveQuestionId}
            />
        </section>
    );
};

const mapStateToProps = (state: RootState) => ({
    user : state.auth.user,
    course : state.course.course,
    session: state.course.session
})

export default connect(mapStateToProps, {})( (props: Omit<Props, 'questions'>) => {
    const isTa = props.user.roles[props.course.courseId] !== undefined;
    const questions = props.session.modality === 'review' ? useSessionQuestions(props.session.sessionId, true) :
        filterUnresolvedQuestions(useSessionQuestions(props.session.sessionId, isTa));
    return <SessionView questions={questions} {...props} />;
});