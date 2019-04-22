import * as React from 'react';

import TopBar from '../includes/TopBar';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';
import { Icon } from 'semantic-ui-react';

import { firestore } from '../includes/firebase';

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
        id: string,
        course: FireCourse,
        isDesktop: boolean,
        session: FireSession
        backCallback: Function,
        joinCallback: Function,
    };

    state: {
        undoAction?: string,
        undoName?: string,
        undoQuestionId?: number,
        timeoutId: number | null,
    };

    questionsContainer: SessionQuestionsContainer | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {
            undoAction: undefined,
            undoName: undefined,
            undoQuestionId: undefined,
            timeoutId: null,
        };

        firestore
            .collection('sessions')
            .doc(this.props.id)
            .onSnapshot((doc) => {
                this.setState({ session: doc.data() });
            });
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

    isOpen = (session: FireSession, interval: number): boolean => {
        return new Date(session.startTime).getTime() - interval * 1000 < new Date().getTime()
            && new Date(session.endTime) > new Date();
    }

    isPast = (session: FireSession): boolean => {
        return new Date() > new Date(session.endTime);
    }

    getOpeningTime = (session: FireSession, interval: number): Date => {
        return new Date(new Date(session.startTime).getTime() - interval * 1000);
    }

    render() {
        var undoText = '';
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

        // var otherQuestions = data.apiGetCurrentUser.nodes[0].questionsByAskerId.nodes
        // // .filter((question) => question.sessionBySessionId.sessionId !== this.props.id)
        // .filter((question) => question.status === 'unresolved')
        // .filter((question) => new Date(question.sessionBySessionId.endTime) >= new Date());


        return (
            <section className="StudentSessionView">
                {/*
                if (error) { return null; }
                        if (!data || !data.apiGetCurrentUser) {
                            return null;
                        } */}

                {this.props.isDesktop &&
                    <TopBar
                        user={data.apiGetCurrentUser.nodes[0]}
                        role={data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role}
                        context="session"
                        courseId={this.props.courseId}
                    />
                }
                {this.props.id === '-1' || !data.sessionBySessionId
                    ? <React.Fragment>
                        <p className="welcomeMessage">Welcome, <span className="welcomeName">
                            {data.apiGetCurrentUser.nodes[0].computedName}
                        </span></p>
                        <p className="noSessionSelected">
                            Please select an office hour from the calendar.
                                        </p>
                    </React.Fragment>
                    : <React.Fragment>
                        <SessionInformationHeader
                            session={data.sessionBySessionId}
                            course={data.courseByCourseId}
                            myUserId={data.apiGetCurrentUser.nodes[0].userId}
                            callback={this.props.backCallback}
                            isDesktop={this.props.isDesktop}
                        />
                        {this.state.undoQuestionId &&
                            <Mutation mutation={UNDO_QUESTION} onCompleted={this.dismissUndo}>
                                {(undoQuestion) =>
                                    <div className="undoContainer">
                                        <p className="undoClose" onClick={this.dismissUndo}>
                                            <Icon name="close" />
                                        </p>
                                        <p className="undoText">
                                            {undoText}
                                            <span
                                                className="undoLink"
                                                onClick={() =>
                                                    this.handleUndoClick(undoQuestion, refetch)
                                                }
                                            >
                                                Undo
                                            </span>
                                        </p>
                                    </div>
                                }
                            </Mutation>
                        }
                        <SessionQuestionsContainer
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
                        />
                    </React.Fragment>
                }
            </section>
        );
    }
}

export default SessionView;
