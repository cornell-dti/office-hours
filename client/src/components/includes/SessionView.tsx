import * as React from 'react';

import TopBar from '../includes/TopBar';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';
import { Interval } from '../../utilities/interval';

import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { Icon } from 'semantic-ui-react';
import SessionAlertModal from './SessionAlertModal';

const GET_SESSION_DATA = gql`
query getDataForSession($sessionId: Int!, $courseId: Int!) {
    apiGetCurrentUser {
        nodes {
            computedName
            computedAvatar
            userId
            courseUsersByUserId(condition: {courseId: $courseId}) {
                nodes {
                    role
                }
            }
            questionsByAskerId {
                nodes {
                    sessionBySessionId {
                        sessionId
                        endTime
                    }
                }
            }
        }
    }
    courseByCourseId(courseId: $courseId) {
        name
        code
        queueOpenInterval {
            seconds
            minutes
            hours
            days
            months
            years
        }
    }
    sessionBySessionId(sessionId: $sessionId) {
        sessionId
        startTime
        endTime
        building
        room
        title
        questionsBySessionId {
            nodes {
                questionId
                content
                status
                timeEntered
                location
                userByAskerId {
                    computedName
                    computedAvatar
                    userId
                }
                userByAnswererId {
                    computedName
                    userId
                }
                questionTagsByQuestionId {
                    nodes {
                        tagByTagId {
                            name
                            level
                            tagId
                        }
                    }
                }
            }
        }
        sessionTasBySessionId {
            nodes {
                userByUserId {
                    computedName
                    computedAvatar
                }
            }
        }
    }
}
`;

interface SessionData {
    sessionBySessionId: AppSession;
    courseByCourseId: AppCourseInterval;
    apiGetCurrentUser: {
        nodes: [AppUserRoleQuestions]
    };
}

interface Variables {
    sessionId: number;
    courseId: number;
}

class SessionDataQuery extends Query<SessionData, Variables> { }

const UNDO_QUESTION = gql`
mutation UndoQuestion($questionId: Int!, $status: String!) {
    updateQuestionByQuestionId(input: {questionPatch: {status: $status, timeAddressed: null, answererId: null},
        questionId: $questionId}) {
        clientMutationId
    }
}
`;

class SessionView extends React.Component {
    props: {
        id: number,
        courseId: number,
        isDesktop: boolean,
        backCallback: Function,
        joinCallback: Function,
    };

    state: {
        undoAction?: string,
        undoName?: string,
        undoQuestionId?: number,
        displayRemoved: boolean,
        timeoutId: number | null,
    };

    questionsContainer: SessionQuestionsContainer | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {
            undoAction: undefined,
            undoName: undefined,
            undoQuestionId: undefined,
            displayRemoved: true,
            timeoutId: null,
        };
        this.toggleRemoved = this.toggleRemoved.bind(this);
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

    toggleRemoved = (toggle: boolean) => {
        this.setState({
            displayRemoved: toggle
        });
    }

    isOpen = (session: AppSession, interval: AppInterval): boolean => {
        return new Date(session.startTime).getTime() - Interval.toMillisecoonds(interval) < new Date().getTime()
            && new Date(session.endTime) > new Date();
    }

    isPast = (session: AppSession): boolean => {
        return new Date() > new Date(session.endTime);
    }

    getOpeningTime = (session: AppSession, interval: AppInterval): Date => {
        return new Date(new Date(session.startTime).getTime() - Interval.toMillisecoonds(interval));
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

        return (
            <section className="StudentSessionView">
                <SessionDataQuery
                    query={GET_SESSION_DATA}
                    variables={{ sessionId: this.props.id, courseId: this.props.courseId }}
                    pollInterval={5000}
                >
                    {({ loading, data, error, refetch }) => {
                        if (error) { return null; }
                        if (!data || !data.apiGetCurrentUser) {
                            return null;
                        }
                        var otherQuestions = data.apiGetCurrentUser.nodes[0].questionsByAskerId.nodes
                            .filter((session) => session.sessionBySessionId.sessionId !== this.props.id)
                            .filter((session) => new Date(session.sessionBySessionId.endTime) >= new Date());

                        return (
                            <React.Fragment>
                                {this.props.isDesktop &&
                                    <TopBar
                                        user={data.apiGetCurrentUser.nodes[0]}
                                        role={data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role}
                                        context="session"
                                        courseId={this.props.courseId}
                                    />
                                }
                                {this.state.displayRemoved && <SessionAlertModal
                                    color={'red'}
                                    description={'A TA has marked you as absent from this office hour ' +
                                        'and removed you from the queue.'}
                                    buttons={['Continue']}
                                    cancelAction={() => this.toggleRemoved(false)}
                                />}
                                {this.props.id === -1 || !data.sessionBySessionId
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
                            </React.Fragment>
                        );
                    }}
                </SessionDataQuery>
            </section>
        );
    }
}

export default SessionView;
