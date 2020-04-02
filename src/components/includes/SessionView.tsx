import React, { useState, useEffect } from 'react';

import TopBar from '../includes/TopBar';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

import { Icon } from 'semantic-ui-react';
import { useCourseTags, useCourseUsersMap } from '../../firehooks';
// import SessionAlertModal from './SessionAlertModal';

type Props = {
    course: FireCourse;
    session: FireSession;
    questions: FireQuestion[];
    isDesktop: boolean;
    backCallback: Function;
    joinCallback: Function;
    user: FireUser;
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

const SessionViewInHooks = (
    { course, session, questions, isDesktop, backCallback, joinCallback, user }: Props
) => {
    const tags = useCourseTags(course.courseId);
    const users = useCourseUsersMap(course.courseId);
    const [
        { undoAction, undoName, undoQuestionId, timeoutId },
        setUndoState
    ] = useState<UndoState>({ timeoutId: null });
    const [, setAbsentState] = useState<AbsentState>({
        showAbsent: true,
        dismissedAbsent: true,
        lastAskedQuestion: null
    });
    const [cachedPrevQuestions, setCachedPrevQuestions] = useState(questions);

    useEffect(() => {
        if (cachedPrevQuestions === questions) {
            return;
        }
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
        setCachedPrevQuestions(questions);
    }, [questions, cachedPrevQuestions, user.userId]);

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

    // RYAN_TODO: implement UNDO feature
    /*
    const handleUndoClick = (undoQuestion: Function, status: string, refetch: Function) => {
        undoQuestion({
            variables: {
                questionId: undoQuestionId,
                status: status
            }
        });
    };
    */

    const isOpen = (session: FireSession, interval: number): boolean => {
        const intervalInMilliseconds = interval * 1000 * 60;
        return session.startTime.toDate().getTime() - intervalInMilliseconds < new Date().getTime()
            && session.endTime.toDate().getTime() > new Date().getTime();
    };

    const isPast = (session: FireSession): boolean => new Date() > new Date(session.endTime.toDate());

    const getOpeningTime = (session: FireSession, interval: number): Date => (
        new Date(new Date(session.startTime.toDate()).getTime() - interval * 1000 * 60)
    );

    let undoText = '';
    // RYAN_TODO: implement UNDO feature
    // let undoStatus = 'unresolved';
    if (undoAction) {
        if (undoAction === 'resolved') {
            undoText = undoName + ' has been resolved! ';
            // undoStatus = 'assigned';
        } else if (undoAction === 'no-show') {
            undoText = undoName + ' has been marked as a no-show. ';
            // undoStatus = 'assigned';
        } else if (undoAction === 'retracted') {
            undoText = 'You have removed your question. ';
            // undoStatus = 'unresolved';
        } else if (undoAction === 'assigned') {
            undoText = undoName + ' has been assigned to you! ';
            // undoStatus = 'unresolved';
        }
    }


    // First check that the session is not ended yet.
    const haveAnotherQuestion = new Date(session.endTime.toDate()) >= new Date()
        && questions.some(({ askerId, status }) => askerId === user.userId && status === 'unresolved');

    return (
        <section className="StudentSessionView">
            {isDesktop &&
                <TopBar
                    user={user}
                    role={user.roles[course.courseId] || 'student'}
                    context="session"
                    courseId={course.courseId}
                />
            }
            <SessionInformationHeader
                session={session}
                course={course}
                myUserId={user.userId}
                callback={backCallback}
                isDesktop={isDesktop}
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
                            // RYAN_TODO
                            // onClick={() => this._handleUndoClick(undoQuestion, refetch)}
                        >
                            Undo
                        </span>
                    </p>
                </div>
            }
            {/* FUTURE_TODO - Just pass in the session and not a bunch of bools */}
            <SessionQuestionsContainer
                isTA={user.roles[course.courseId] !== undefined}
                questions={questions.filter(q => q.status === 'unresolved' || q.status === 'assigned')}
                users={users}
                tags={tags}
                handleJoinClick={joinCallback}
                myUserId={user.userId}
                triggerUndo={triggerUndo}
                isOpen={isOpen(session, course.queueOpenInterval)}
                isPast={isPast(session)}
                openingTime={getOpeningTime(session, course.queueOpenInterval)}
                haveAnotherQuestion={haveAnotherQuestion}
            />
            {/* {this.state.showAbsent && !this.state.dismissedAbsent && (
                <SessionAlertModal
                    color={'red'}
                    description={'A TA has marked you as absent from this office hour ' +
                        'and removed you from the queue.'}
                    OHSession={this.props.session}
                    buttons={['Continue']}
                    cancelAction={() => this.setState({ dismissedAbsent: true })}
                    displayShade={true}
                />
            )} */}
        </section>
    );
};

export default SessionViewInHooks;
