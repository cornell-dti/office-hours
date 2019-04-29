import * as React from 'react';

import TopBar from '../includes/TopBar';
import SessionInformationHeader from '../includes/SessionInformationHeader';
// import SessionQuestionsContainer from '../includes/SessionQustionsContainer';
import { Icon } from 'semantic-ui-react';

import { useState } from 'react';
import { useUser, useSession } from '../../firestoreHooks';

// const isOpen = (session: FireSession, interval: number): boolean => {
//     return new Date(session.startTime.seconds).getTime() - interval * 1000 < new Date().getTime()
//         && new Date(session.endTime.seconds) > new Date();
// }

// const isPast = (session: FireSession): boolean => {
//     return new Date() > new Date(session.endTime.seconds);
// }

// const getOpeningTime = (session: FireSession, interval: number): Date => {
//     return new Date(new Date(session.startTime.seconds).getTime() - interval * 1000);
// }

// const triggerUndo = (
//     timeoutId: NodeJS.Timeout | undefined,
//     questionId: number,
//     action: string,
//     name: string,
//     setUndoAction: React.Dispatch<React.SetStateAction<String | undefined>>,
//     setUndoName: React.Dispatch<React.SetStateAction<String | undefined>>,
//     setUndoQuestionId: React.Dispatch<React.SetStateAction<number | undefined>>,
//     setTimeoutId: React.Dispatch<React.SetStateAction<NodeJS.Timeout | undefined>>
// ) => {
//     if (timeoutId) {
//         clearTimeout(timeoutId);
//     }
//     setUndoAction(action);
//     setUndoName(name);
//     setUndoQuestionId(questionId);
//     setTimeoutId(setTimeout(dismissUndo, 10000));
// }

const dismissUndo = (
    timeoutId: NodeJS.Timeout | undefined,
    setUndoAction: React.Dispatch<React.SetStateAction<String | undefined>>,
    setUndoName: React.Dispatch<React.SetStateAction<String | undefined>>,
    setUndoQuestionId: React.Dispatch<React.SetStateAction<number | undefined>>,
    setTimeoutId: React.Dispatch<React.SetStateAction<NodeJS.Timeout | undefined>>

) => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    setUndoAction(undefined);
    setUndoName(undefined);
    setUndoQuestionId(undefined);
    setTimeoutId(undefined);
};

const getUndoText = (action: String | undefined, undoName: String | undefined) => {
    if (action === 'resolved') {
        return undoName + ' has been resolved! ';
    } else if (action === 'no-show') {
        return undoName + ' has been marked as a no-show. ';
    } else if (action === 'retracted') {
        return 'You have removed your question. ';
    } else if (action === 'assigned') {
        return undoName + ' has been assigned to you! ';
    } else {
        return '';
    }
};

const handleUndoClick = (undoQuestionId: number, undoAction: String | undefined) => {
    // undoQuestion({
    //     variables: {
    //         questionId: undoQuestionId,
    //         // Set question status to unresolved if it's in the assigned state
    //         // Otherwise, default it to assigned
    //         status: undoAction === 'assigned' ? 'unresolved' : 'assigned'
    //     }
    // });
    alert('TODO: Undo');
};

const SessionView = (props: {
    id: string,
    course?: FireCourse,
    isDesktop: boolean,
    backCallback: Function,
    joinCallback: Function,
    userId: string
}) => {

    const [undoAction, setUndoAction] = useState<string | undefined>(undefined);
    const [undoName, setUndoName] = useState<string | undefined>(undefined);
    const [undoQuestionId, setUndoQuestionId] = useState<number | undefined>(undefined);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(undefined);
    const user = useUser(props.userId);
    const session = useSession(props.id);

    return (
        <section className="StudentSessionView">
            {props.isDesktop && user && // LTODO Skeleton
                <TopBar
                    user={user}
                    role={'professor'} // TODO
                    context="session"
                    courseId={props.course && props.course.id || ''}
                />
            }
            {session && session.title ?
                <React.Fragment>
                    <SessionInformationHeader
                        session={session}
                        course={props.course}
                        userId={props.userId}
                        callback={props.backCallback}
                        isDesktop={props.isDesktop}
                    />
                    {undoQuestionId &&
                        // TODO Interactivity
                        <div className="undoContainer">
                            <p
                                className="undoClose"
                                onClick={() =>
                                    dismissUndo(timeoutId, setUndoAction, setUndoName, setUndoQuestionId, setTimeoutId)
                                }
                            >
                                <Icon name="close" />
                            </p>
                            <p className="undoText">
                                {getUndoText(undoAction, undoName)}
                                <span
                                    className="undoLink"
                                    onClick={() => handleUndoClick(undoQuestionId, undoAction)}
                                >
                                    Undo
                                </span>
                            </p>
                        </div>
                    }
                    { /*<SessionQuestionsContainer
                        isTA={data.apiGetCurrentUser.nodes[0].
                            courseUsersByUserId.nodes[0].role !== 'student'}
                        questions={data.sessionBySessionId.questionsBySessionId
                            .nodes.filter(
                                q => q.status === 'unresolved' || q.status === 'assigned')}
                        handleJoinClick={props.joinCallback}
                        myUserId={data.apiGetCurrentUser.nodes[0].userId}
                        triggerUndo={triggerUndo}
                        refetch={refetch}
                        // this sets a ref, which allows a parent to call methods on a child.
                        // Here, the parent can't access refetch, but the child can.
                        ref={(ref) => questionsContainer = ref}
                        isOpen={isOpen(
                            data.sessionBySessionId,
                            data.courseByCourseId.queueOpenInterval)}
                        isPast={isPast(data.sessionBySessionId)}
                        openingTime={getOpeningTime(
                            data.sessionBySessionId, data.courseByCourseId.queueOpenInterval)}
                        haveAnotherQuestion={otherQuestions.length > 0}
                    /> */}
                </React.Fragment> : <React.Fragment>
                    <p className="welcomeMessage">Welcome, <span className="welcomeName">
                        {user && user.firstName}
                    </span></p>
                    <p className="noSessionSelected">
                        Please select an office hour from the calendar.
                    </p>
                </React.Fragment>

            }
        </section>
    );
};

export default SessionView;
