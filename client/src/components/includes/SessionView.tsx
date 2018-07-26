import * as React from 'react';

import TopBar from '../includes/TopBar';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import { Icon } from 'semantic-ui-react';

const GET_SESSION_DATA = gql`
query getDataForSession($sessionId: Int!, $courseId: Int!) {
    apiGetCurrentUser {
        nodes {
            firstName
            lastName
            photoUrl
            userId
            courseUsersByUserId(condition:{courseId:$courseId}) {
                nodes {
                    role
                }
            }
        }
    }
    courseByCourseId(courseId: $courseId) {
        name
        code
    }
    sessionBySessionId(sessionId: $sessionId) {
        sessionId
        startTime
        endTime
        building
        room
        questionsBySessionId {
            nodes {
                questionId
                content
                status
                timeEntered
                userByAskerId {
                    firstName
                    lastName
                    photoUrl
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
                    firstName
                    lastName
                    photoUrl
                }
            }
        }
    }
}
`;

interface SessionData {
    sessionBySessionId: AppSession;
    courseByCourseId: AppCourse;
    apiGetCurrentUser: {
        nodes: [AppUserRole]
    };
}

interface Variables {
    sessionId: number;
    courseId: number;
}

class SessionDataQuery extends Query<SessionData, Variables> { }

const UNDO_QUESTION = gql`
mutation UndoQuestion($questionId: Int!) {
    updateQuestionByQuestionId(input: {questionPatch: {status: "unresolved", timeAddressed: null, answererId: null}, 
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
        timeoutId: number | null,
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            undoAction: undefined,
            undoName: undefined,
            undoQuestionId: undefined,
            timeoutId: null,
        };
        this.triggerUndo = this.triggerUndo.bind(this);
        this.dismissUndo = this.dismissUndo.bind(this);
        this.handleUndoClick = this.handleUndoClick.bind(this);
    }

    triggerUndo(questionId: number, action: string, name: string) {
        if (this.state.timeoutId) {
            clearTimeout(this.state.timeoutId);
        }
        this.setState({
            undoQuestionId: questionId,
            undoAction: action,
            undoName: name,
            timeoutId: setTimeout(this.dismissUndo, 15000),
        });
    }

    dismissUndo() {
        if (this.state.timeoutId) {
            clearTimeout(this.state.timeoutId);
        }
        this.setState({
            undoAction: undefined,
            undoName: undefined,
            undoQuestionId: undefined,
            timeoutId: null,
        });
    }

    handleUndoClick(undoQuestion: Function) {
        undoQuestion({
            variables: {
                questionId: this.state.undoQuestionId
            }
        });
    }

    render() {

        var undoText = '';
        if (this.state.undoAction) {
            if (this.state.undoAction === 'resolved') {
                undoText = this.state.undoName + ' has been resolved!';
            } else if (this.state.undoAction === 'no-show') {
                undoText = this.state.undoName + ' has been marked as a no-show.';
            } else if (this.state.undoAction === 'retracted') {
                undoText = 'You have removed your question';
            }
        }

        return (
            <section className="StudentSessionView">
                <SessionDataQuery
                    query={GET_SESSION_DATA}
                    variables={{ sessionId: this.props.id, courseId: this.props.courseId }}
                    pollInterval={5000}
                >
                    {({ loading, data, error }) => {
                        if (error) { return <h1>ERROR</h1>; }
                        if (!data || !data.apiGetCurrentUser) {
                            return <p className="noSessionSelected">Loading...</p>;
                        }
                        return (
                            <React.Fragment>
                                {this.props.isDesktop && <TopBar user={data.apiGetCurrentUser.nodes[0]} />}
                                {this.props.id === -1 || !data.sessionBySessionId
                                    ? <React.Fragment>
                                        <p className="welcomeMessage">Welcome, <span className="welcomeName">
                                            {data.apiGetCurrentUser.nodes[0].firstName + ' '
                                                + data.apiGetCurrentUser.nodes[0].lastName}
                                        </span></p>
                                        <p className="noSessionSelected">
                                            Please select an office hour from the calendar.
                                        </p>
                                    </React.Fragment>
                                    : <React.Fragment>
                                        <SessionInformationHeader
                                            session={data.sessionBySessionId}
                                            course={data.courseByCourseId}
                                            callback={this.props.backCallback}
                                            isDesktop={this.props.isDesktop}
                                        />
                                        {
                                            this.state.undoQuestionId &&
                                            <Mutation mutation={UNDO_QUESTION} onCompleted={this.dismissUndo}>
                                                {(undoQuestion) =>
                                                    <div className="undoContainer">
                                                        <p className="undoClose" onClick={this.dismissUndo}>
                                                            <Icon name="close" />
                                                        </p>
                                                        <p className="undoText">
                                                            {undoText} <span
                                                                className="undoLink"
                                                                onClick={() => this.handleUndoClick(undoQuestion)}
                                                            >
                                                                Undo
                                                            </span>
                                                        </p>
                                                    </div>
                                                }
                                            </Mutation>
                                        }
                                        <div className="splitQuestions">
                                            <SessionQuestionsContainer
                                                isTA={data.apiGetCurrentUser.nodes[0].
                                                    courseUsersByUserId.nodes[0].role !== 'student'}
                                                questions={data.sessionBySessionId.questionsBySessionId
                                                    .nodes.filter(q => q.status === 'unresolved')}
                                                handleJoinClick={this.props.joinCallback}
                                                myUserId={data.apiGetCurrentUser.nodes[0].userId}
                                                triggerUndo={this.triggerUndo}
                                            />
                                        </div>
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
