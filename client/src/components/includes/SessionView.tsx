import * as React from 'react';

import TopBar from '../includes/TopBar';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

import { Icon } from 'semantic-ui-react';
import SessionAlertModal from './SessionAlertModal';

// RYAN_TODO
// const UNDO_QUESTION = gql`
// mutation UndoQuestion($questionId: Int!, $status: String!) {
//     updateQuestionByQuestionId(input: {questionPatch: {status: $status, timeAddressed: null, answererId: null},
//         questionId: $questionId}) {
//         clientMutationId
//     }
// }
// `;

type Props = {
    course: FireCourse;
    session: FireSession;
    questions: FireQuestion[];
    isDesktop: boolean;
    backCallback: Function;
    joinCallback: Function;
    user: FireUser;
    courseUser: FireCourseUser;
};
type State = {
    undoAction?: string;
    undoName?: string;
    undoQuestionId?: number;
    timeoutId: NodeJS.Timeout | null;
    showAbsent: boolean;
    dismissedAbsent: boolean;
    lastAskedQuestion: FireQuestion | null;
};

class SessionView extends React.Component<Props, State> {
    state: State = {
        undoAction: undefined,
        undoName: undefined,
        undoQuestionId: undefined,
        timeoutId: null,
        showAbsent: true,
        dismissedAbsent: true,
        lastAskedQuestion: null
    };

    triggerUndo = (questionId: number, action: string, name: string) => {
        if (this.state.timeoutId) {
            clearTimeout(this.state.timeoutId);
        }
        this.setState({
            undoQuestionId: questionId,
            undoAction: action,
            undoName: name,
            timeoutId: setTimeout(this.dismissUndo, 10000),
        });
    };

    dismissUndo = () => {
        if (this.state.timeoutId) {
            clearTimeout(this.state.timeoutId);
        }
        this.setState({
            undoAction: undefined,
            undoName: undefined,
            undoQuestionId: undefined,
            timeoutId: null,
        });
    };

    handleUndoClick = (undoQuestion: Function, status: string, refetch: Function) => {
        undoQuestion({
            variables: {
                questionId: this.state.undoQuestionId,
                status: status
            }
        });
    };

    isOpen = (session: FireSession, interval: number): boolean => {
        const intervalInMilliseconds = interval * 1000 * 60;
        return session.startTime.toDate().getTime() - intervalInMilliseconds < new Date().getTime()
            && session.endTime.toDate().getTime() > new Date().getTime();
    };

    isPast = (session: FireSession): boolean => {
        return new Date() > new Date(session.endTime.toDate());
    };

    getOpeningTime = (session: FireSession, interval: number): Date => {
        return new Date(new Date(session.startTime.toDate()).getTime() - interval * 1000 * 60);
    };

    componentDidUpdate(prevProps: Props) {
        const { user, questions } = this.props;
        if (prevProps.questions === questions) {
            return;
        }
        const myQuestions = questions.filter(q => q.askerId === user.userId);
        const lastAskedQuestion = myQuestions.length > 0
            ? myQuestions.reduce(
                (prev, current) => prev.timeEntered.toDate() > current.timeEntered.toDate() ? prev : current
            )
            : null;

        this.setState(currentState => {
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
    }

    render() {
        let undoText = '';
        let undoStatus = 'unresolved';
        if (this.state.undoAction) {
            if (this.state.undoAction === 'resolved') {
                undoText = this.state.undoName + ' has been resolved! ';
                undoStatus = 'assigned';
            } else if (this.state.undoAction === 'no-show') {
                undoText = this.state.undoName + ' has been marked as a no-show. ';
                undoStatus = 'assigned';
            } else if (this.state.undoAction === 'retracted') {
                undoText = 'You have removed your question. ';
                undoStatus = 'unresolved';
            } else if (this.state.undoAction === 'assigned') {
                undoText = this.state.undoName + ' has been assigned to you! ';
                undoStatus = 'unresolved';
            }
        }

        const { user, courseUser, course, session, questions } = this.props;

        // First check that the session is not ended yet.
        const haveAnotherQuestion = new Date(session.endTime.toDate()) >= new Date()
            && questions.some(
                ({ askerId, status }) => askerId === user.userId && status === 'unresolved'
            );

        const userQuestions = questions.filter(question => question.askerId === user.userId);
        const lastAskedQuestion = userQuestions.length > 0 ?
            userQuestions.reduce(
                (prev, current) => prev.timeEntered.toDate() > current.timeEntered.toDate() ? prev : current
            )
            : null;

        return (
            <section className="StudentSessionView">
                {this.props.isDesktop &&
                    <TopBar
                        user={user}
                        role={courseUser.role}
                        context="session"
                        courseId={course.courseId}
                    />
                }
                <SessionInformationHeader
                    session={session}
                    course={course}
                    myUserId={user.userId}
                    callback={this.props.backCallback}
                    isDesktop={this.props.isDesktop}
                />
                {this.state.undoQuestionId &&
                    <div className="undoContainer">
                        <p className="undoClose" onClick={this.dismissUndo}>
                            <Icon name="close" />
                        </p>
                        <p className="undoText">
                            {undoText}
                            <span
                                className="undoLink"
                                onClick={() =>
                                    console.log('RYAN_TODO')
                                    // this.handleUndoClick(undoQuestion, refetch)
                                }
                            >
                                Undo
                            </span>
                        </p>
                    </div>
                }
                {/* FUTURE_TODO - Just pass in the session and not a bunch of bools */}
                <SessionQuestionsContainer
                    isTA={this.props.courseUser.role !== 'student'}
                    questions={this.props.questions.filter(
                        q => q.status === 'unresolved' || q.status === 'assigned')}
                    handleJoinClick={this.props.joinCallback}
                    myUserId={this.props.user.userId}
                    triggerUndo={this.triggerUndo}
                    isOpen={this.isOpen(this.props.session, this.props.course.queueOpenInterval)}
                    isPast={this.isPast(this.props.session)}
                    openingTime={this.getOpeningTime(this.props.session, this.props.course.queueOpenInterval)}
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
    }
}

export default SessionView;
