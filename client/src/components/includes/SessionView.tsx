import * as React from 'react';

import TopBar from '../includes/TopBar';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_SESSION_DATA = gql`
query getDataForSession($sessionId: Int!, $courseId: Int!) {
    apiGetCurrentUser {
        nodes {
            computedName
            computedAvatar
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
                    computedName
                    computedAvatar
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

class SessionView extends React.Component {
    props: {
        id: number,
        courseId: number,
        isDesktop: boolean,
        backCallback: Function,
        joinCallback: Function,
    };

    render() {
        return (
            <section className="StudentSessionView">
                <SessionDataQuery
                    query={GET_SESSION_DATA}
                    variables={{ sessionId: this.props.id, courseId: this.props.courseId }}
                    pollInterval={4000}
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
                                            callback={this.props.backCallback}
                                            isDesktop={this.props.isDesktop}
                                        />
                                        <div className="splitQuestions">
                                            <SessionQuestionsContainer
                                                isTA={data.apiGetCurrentUser.nodes[0].
                                                    courseUsersByUserId.nodes[0].role !== 'student'}
                                                questions={data.sessionBySessionId.questionsBySessionId
                                                    .nodes.filter(q => q.status === 'unresolved')}
                                                handleJoinClick={this.props.joinCallback}
                                                myUserId={data.apiGetCurrentUser.nodes[0].userId}
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
