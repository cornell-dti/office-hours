import * as React from 'react';

import TopBar from '../includes/TopBar';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

import { Icon } from 'semantic-ui-react';
// import SessionAlertModal from './SessionAlertModal';

import { firestore, loggedIn$, collectionData } from '../../firebase';

// RYAN_TODO
// const UNDO_QUESTION = gql`
// mutation UndoQuestion($questionId: Int!, $status: String!) {
//     updateQuestionByQuestionId(input: {questionPatch: {status: $status, timeAddressed: null, answererId: null},
//         questionId: $questionId}) {
//         clientMutationId
//     }
// }
// `;

class SessionView extends React.Component {
    props: {
        session: FireSession,
        course: FireCourse,
        isDesktop: boolean,
        backCallback: Function,
        joinCallback: Function,
        user: FireUser,
        courseUser: FireCourseUser,
    };

    state: {
        undoAction?: string,
        undoName?: string,
        undoQuestionId?: number,
        timeoutId: number | null,
        showAbsent: boolean
        dismissedAbsent: boolean,
        userId?: string,
        questions: FireQuestion[]
    };

    questionsContainer: SessionQuestionsContainer | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {
            undoAction: undefined,
            undoName: undefined,
            undoQuestionId: undefined,
            timeoutId: null,
            showAbsent: true,
            dismissedAbsent: true,
            questions: []
        };

        loggedIn$.subscribe(user => this.setState({ userId: user.uid }));

        const questions$ = collectionData(
            firestore
                .collection('questions')
                .where('sessionId', '==', firestore.doc('sessions/' + this.props.session.sessionId)),
            // RYAN_TODO filter
            'questionId'
        );

        questions$.subscribe((questions: FireQuestion[]) => this.setState({ questions }));
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
    }

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
        if (this.questionsContainer) {
            this.questionsContainer.props.refetch();
        }
    }

    handleUndoClick = (undoQuestion: Function, refetch: Function) => {
        undoQuestion({
            variables: {
                questionId: this.state.undoQuestionId,
                // Set question status to unresolved if it's in the assigned state
                // Otherwise, default it to assigned
                status: this.state.undoAction === 'assigned' ? 'unresolved' : 'assigned'
            }
        });
    }

    isOpen = (session: FireSession, interval: FireTimestamp): boolean => {
        return new Date(session.startTime.seconds).getTime() - interval.seconds * 1000 < new Date().getTime()
            && new Date(session.endTime.seconds) > new Date();
    }

    isPast = (session: FireSession): boolean => {
        return new Date() > new Date(session.endTime.seconds);
    }

    getOpeningTime = (session: FireSession, interval: FireTimestamp): Date => {
        return new Date(new Date(session.startTime.seconds).getTime() - interval.seconds * 1000);
    }

    render() {
        let undoText = '';
        if (this.state.undoAction) {
            if (this.state.undoAction === 'resolved') {
                undoText = this.state.undoName + ' has been resolved! ';
            } else if (this.state.undoAction === 'no-show') {
                undoText = this.state.undoName + ' has been marked as a no-show. ';
            } else if (this.state.undoAction === 'retracted') {
                undoText = 'You have removed your question. ';
            } else if (this.state.undoAction === 'assigned') {
                undoText = this.state.undoName + ' has been assigned to you! ';
            }
        }
        // const otherQuestions = [];
        // data.apiGetCurrentUser.nodes[0].questionsByAskerId.nodes
        //     .filter((question) => question.sessionBySessionId.sessionId !== this.props.id)
        //     .filter((question) => question.status === 'unresolved')
        //     .filter((question) => new Date(question.sessionBySessionId.endTime) >= new Date());

        // const userQuestions: FireQuestion[] = []; // data.apiGetCurrentUser.nodes[0].questionsByAskerId.nodes;

        // const lastAskedQuestion = userQuestions.length > 0 ?
        //     userQuestions.reduce((prev, current) => new Date(prev.timeEntered) >
        //         new Date(current.timeEntered) ? prev : current) : null;

        // if (lastAskedQuestion !== null &&
        //     lastAskedQuestion.status !== 'no-show' &&
        //     this.state.showAbsent) {
        //     this.setState({ showAbsent: false, dismissedAbsent: true });
        // }

        // if (lastAskedQuestion !== null &&
        //     lastAskedQuestion.status === 'no-show' &&
        //     !this.state.showAbsent &&
        //     this.state.dismissedAbsent) {
        //     this.setState({ showAbsent: true, dismissedAbsent: false });
        // }

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
                {/* <SessionQuestionsContainer
                    isTA={data.apiGetCurrentUser.nodes[0].
                        courseUsersByUserId.nodes[0].role !== 'student'}
                    questions={data.sessionBySessionId.questionsBySessionId
                        .nodes.filter(
                            q => q.status === 'unresolved' || q.status === 'assigned')}
                    handleJoinClick={this.props.joinCallback}
                    myUserId={data.apiGetCurrentUser.nodes[0].userId}
                    triggerUndo={this.triggerUndo}
                    refetch={refetch}
                    // this sets a ref, which allows a parent to call methods on a child.
                    // Here, the parent can't access refetch, but the child can.
                    ref={(ref) => this.questionsContainer = ref}
                    isOpen={this.isOpen(
                        data.sessionBySessionId,
                        data.courseByCourseId.queueOpenInterval)}
                    isPast={this.isPast(data.sessionBySessionId)}
                    openingTime={this.getOpeningTime(
                        data.sessionBySessionId, data.courseByCourseId.queueOpenInterval)}
                    haveAnotherQuestion={otherQuestions.length > 0}
                /> */}

                {/* {lastAskedQuestion !== null && this.state.showAbsent && !this.state.dismissedAbsent &&
                    <SessionAlertModal
                        color={'red'}
                        description={'A TA has marked you as absent from this office hour ' +
                            'and removed you from the queue.'}
                        OHSession={lastAskedQuestion.sessionBySessionId}
                        buttons={['Continue']}
                        cancelAction={() => this.setState({ dismissedAbsent: true })}
                        displayShade={true}
                    />} */}
            </section>
        );
    }
}

export default SessionView;
