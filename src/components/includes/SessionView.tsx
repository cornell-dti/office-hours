import React, { useState, useEffect, useCallback } from 'react';
import addNotification from 'react-push-notification';

import TopBar from './TopBar';
import SessionInformationHeader from './SessionInformationHeader';
import SessionQuestionsContainer from './SessionQuestionsContainer';
import UpdateProfile from './UpdateProfile';

import { useCourseTags, useCourseUsersMap, useSessionQuestions, useSessionProfile } from '../../firehooks';
import { filterUnresolvedQuestions } from '../../utilities/questions';
import { updateVirtualLocation } from '../../firebasefunctions';
import { firestore } from '../../firebase';

type Props = {
    course: FireCourse;
    session: FireSession;
    questions: readonly FireQuestion[];
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

const SessionView = (
    { course, session, questions, isDesktop, backCallback, joinCallback, user }: Props
) => {
    const isTa = user.roles[course.courseId] !== undefined;
    const tags = useCourseTags(course.courseId);
    const users = useCourseUsersMap(course.courseId, isTa);

    const [
        { undoQuestionId, timeoutId },
        setUndoState
    ] = useState<UndoState>({ timeoutId: null });
    const [, setAbsentState] = useState<AbsentState>({
        showAbsent: true,
        dismissedAbsent: true,
        lastAskedQuestion: null
    });

    const [prevQuestSet, setPrevQuestSet] = useState(new Set(questions.map(q => q.questionId)));

    const sessionProfile = useSessionProfile(user.userId, session.sessionId);

    const updateSessionProfile = useCallback((virtualLocation: string) => {
        if (session.modality !== 'virtual') {
            return;
        }

        const batch = firestore.batch();

        const questionUpdate: Partial<FireQuestion> = { location: virtualLocation };
        questions.forEach((q) => {
            if (session.host === 'ta' && q.answererId === user.userId && q.status === 'assigned') {
                batch.update(firestore.doc(`questions/${q.questionId}`), questionUpdate);
            } else if (session.host === 'student' && q.askerId === user.userId) {
                batch.update(firestore.doc(`questions/${q.questionId}`), questionUpdate);
            }
        });

        batch.commit();
    }, [session, questions, user.userId]);

    useEffect(() => {
        const questionIds = questions.map(q => q.questionId);

        const newQuestions = new Set(questionIds.filter(q => !prevQuestSet.has(q)));

        if (newQuestions.size <= 0) {
            return;
        }

        if ((user.roles[course.courseId] === 'professor' ||
            user.roles[course.courseId] === 'ta') && questions.length > 0) {
            addNotification({
                title: 'A new question has been added!',
                message: 'Check the queue.',
                native: true
            })
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
        setPrevQuestSet(new Set(questions.map(q => q.questionId)));
    }, [prevQuestSet, questions, user.userId, course.courseId, user.roles]);


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

    // TODO(ewlsh): implement UNDO feature
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

    const isOpen = (s: FireSession, interval: number): boolean => {
        const intervalInMilliseconds = interval * 1000 * 60;
        return s.startTime.toDate().getTime() - intervalInMilliseconds < new Date().getTime()
            && s.endTime.toDate().getTime() > new Date().getTime();
    };

    const isPast = (s: FireSession): boolean => new Date() > new Date(s.endTime.toDate());

    const getOpeningTime = (s: FireSession, interval: number): Date => (
        new Date(new Date(s.startTime.toDate()).getTime() - interval * 1000 * 60)
    );

    // let undoText = '';
    // TODO(ewlsh): implement UNDO feature
    // let undoStatus = 'unresolved';
    // if (undoAction) {
    //     if (undoAction === 'resolved') {
    //         undoText = undoName + ' has been resolved! ';
    //         // undoStatus = 'assigned';
    //     } else if (undoAction === 'no-show') {
    //         undoText = undoName + ' has been marked as a no-show. ';
    //         // undoStatus = 'assigned';
    //     } else if (undoAction === 'retracted') {
    //         undoText = 'You have removed your question. ';
    //         // undoStatus = 'unresolved';
    //     } else if (undoAction === 'assigned') {
    //         undoText = undoName + ' has been assigned to you! ';
    //         // undoStatus = 'unresolved';
    //     }
    // }


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
                user={user}
                callback={backCallback}
                isDesktop={isDesktop}
            />
            {
                session.modality === 'virtual' &&
                ((session.host === 'ta' && isTa) || 
                (session.host === 'student' && !isTa && questions.some(q => q.askerId === user.userId)) ? 
                    <UpdateProfile
                        zoom={!isTa}
                        virtualLocation={sessionProfile?.virtualLocation}
                        onUpdate={(virtualLocation) => {
                            updateVirtualLocation(firestore, user, session, virtualLocation);
                        
                            if (virtualLocation) {
                                updateSessionProfile(virtualLocation);
                            }
                        }}
                    /> : <></>)
            }
            {undoQuestionId && <></>
                // <div className="undoContainer">
                //     <p className="undoClose" onClick={dismissUndo}>
                //         <Icon name="close" />
                //     </p>
                //     <p className="undoText">
                //         {undoText}
                //         <span
                //             className="undoLink"
                //         // TODO(ewlsh)
                //         // onClick={() => this._handleUndoClick(undoQuestion, refetch)}
                //         >
                //             Undo
                //         </span>
                //     </p>
                // </div>
            }
            {/* TODO(ewlsh) - Just pass in the session and not a bunch of bools */}
            <SessionQuestionsContainer
                isTA={isTa}
                modality={session.modality}
                session={session}
                myVirtualLocation={
                    (session.modality === 'virtual' && session.host === 'ta' 
                    && sessionProfile && sessionProfile.virtualLocation) || undefined
                }
                questions={questions.filter(q => q.status === 'unresolved' || q.status === 'assigned')}
                users={users}
                tags={tags}
                handleJoinClick={joinCallback}
                myUserId={user.userId}
                user={user}
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

export default (props: Omit<Props, 'questions'>) => {
    const isTa = props.user.roles[props.course.courseId] !== undefined;
    const questions = filterUnresolvedQuestions(useSessionQuestions(props.session.sessionId, isTa));
    return <SessionView questions={questions} {...props} />;
};
