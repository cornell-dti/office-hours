import * as React from 'react';

import TopBar from '../includes/TopBar';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

import { Icon } from 'semantic-ui-react';
import SessionAlertModal from './SessionAlertModal';

import { firestore, loggedIn$, collectionData } from '../../firebase';
import { Observable, Subscription } from 'rxjs';

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
    session: FireSession;
    course: FireCourse;
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
    userId?: string;
    questions: FireQuestion[];
    lastAskedQuestion: FireQuestion | null;
    otherActiveQuestions: boolean;
};

class SessionView extends React.Component<Props, State> {
    loggedInSubscription?: Subscription;
    questionsSubscription?: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            undoAction: undefined,
            undoName: undefined,
            undoQuestionId: undefined,
            timeoutId: null,
            showAbsent: true,
            dismissedAbsent: true,
            questions: [],
            lastAskedQuestion: null,
            otherActiveQuestions: false
        };
    }

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

    componentDidMount() {
        this.loggedInSubscription = loggedIn$.subscribe(user => this.setState({ userId: user.uid }));

        const questions$: Observable<FireQuestion[]> = collectionData(
            firestore.collection('questions').where('sessionId', '==', this.props.session.sessionId),
            'questionId'
        );

        this.questionsSubscription = questions$.subscribe(questions => {
            // First check that the session is not ended yet.
            const sessionStillOngoing = new Date(this.props.session.endTime.toDate()) >= new Date();
            const otherActiveQuestions = sessionStillOngoing
                && questions.some(
                    ({ askerId, status }) => askerId === this.props.user.userId && status === 'unresolved'
                );

            const lastAskedQuestion = questions.length > 0 ?
                questions.reduce(
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
                return { otherActiveQuestions, questions, lastAskedQuestion, showAbsent, dismissedAbsent };
            });
        });
    }

    componentWillUnmount() {
        this.loggedInSubscription && this.loggedInSubscription.unsubscribe();
        this.questionsSubscription && this.questionsSubscription.unsubscribe();
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

        return (
            <section className="StudentSessionView">
                {this.props.isDesktop &&
                    <TopBar
                        user={this.props.user}
                        role={this.props.courseUser.role}
                        context="session"
                        courseId={this.props.course.courseId}
                    />
                }
                <SessionInformationHeader
                    session={this.props.session}
                    course={this.props.course}
                    myUserId={this.state.userId}
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
                    questions={this.state.questions}
                    handleJoinClick={this.props.joinCallback}
                    myUserId={this.props.user.userId}
                    triggerUndo={this.triggerUndo}
                    isOpen={this.isOpen(this.props.session, this.props.course.queueOpenInterval)}
                    isPast={this.isPast(this.props.session)}
                    openingTime={this.getOpeningTime(this.props.session, this.props.course.queueOpenInterval)}
                    haveAnotherQuestion={this.state.otherActiveQuestions}
                />
                {this.state.lastAskedQuestion !== null && this.state.showAbsent && !this.state.dismissedAbsent && (
                    <SessionAlertModal
                        color={'red'}
                        description={'A TA has marked you as absent from this office hour ' +
                            'and removed you from the queue.'}
                        OHSession={this.props.session}
                        buttons={['Continue']}
                        cancelAction={() => this.setState({ dismissedAbsent: true })}
                        displayShade={true}
                    />
                )}
            </section>
        );
    }
}

export default SessionView;
