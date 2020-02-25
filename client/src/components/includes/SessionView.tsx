import * as React from 'react';

import TopBar from '../includes/TopBar';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

import { Icon } from 'semantic-ui-react';
// import SessionAlertModal from './SessionAlertModal';

import { firestore, loggedIn$, collectionData } from '../../firebase';
import { Observable } from 'rxjs';

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
    props!: {
        session: FireSession;
        course: FireCourse;
        isDesktop: boolean;
        backCallback: Function;
        joinCallback: Function;
        user: FireUser;
        courseUser: FireCourseUser;
    };

    state!: {
        undoAction?: string;
        undoName?: string;
        undoQuestionId?: number;
        timeoutId: number | null;
        showAbsent: boolean;
        dismissedAbsent: boolean;
        userId?: string;
        questions: FireQuestion[];
        otherActiveQuestions: boolean;
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            undoAction: undefined,
            undoName: undefined,
            undoQuestionId: undefined,
            timeoutId: null,
            showAbsent: true,
            dismissedAbsent: true,
            questions: [],
            otherActiveQuestions: false
        };

        loggedIn$.subscribe(user => this.setState({ userId: user.uid }));

        const questions$: Observable<FireQuestion[]> = collectionData(
            firestore
                .collection('questions'),
            // .where('sessionId', '==', firestore.doc('sessions/' + this.props.session.sessionId)),
            // RYAN_TODO filter
            'questionId'
        );

        questions$.subscribe(questions => { this.setState({ questions }); });
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
        return new Date(session.startTime.toDate()) < new Date()
            && new Date(session.endTime.toDate()) > new Date();
    };

    isPast = (session: FireSession): boolean => {
        return new Date() > new Date(session.endTime.toDate());
    };

    getOpeningTime = (session: FireSession, interval: number): Date => {
        return new Date(new Date(session.startTime.toDate()).getTime() - interval * 1000);
    };

    componentDidMount() {
        let otherQuestions = false;
        firestore.collection('questions')
            .where('askerId', '==', this.props.user.userId)
            .where('status', '==', 'unresolved')
            .onSnapshot(querySnapshot => {
                otherQuestions = false;
                querySnapshot.forEach(doc => {
                    if (doc.data().endTime >= new Date().getTime() / 1000) {
                        otherQuestions = true;
                    }
                });
                this.setState({ otherActiveQuestions: otherQuestions });
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

        // RYAN_TODO: check master for production behavior.

        // const questionsRef = firestore.collection('questions');

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
