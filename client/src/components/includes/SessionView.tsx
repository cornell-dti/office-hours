import * as React from 'react';

import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_SESSION_DATA = gql`
query getDataForSession($sessionId: Int!, $courseId: Int!) {
    apiGetCurrentUser {
        nodes {
            courseUsersByUserId(condition:{courseId:$courseId}) {
                nodes {
                    role
                    userId
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
    apiGetCurrentUser: CurrentUserRole;
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
                {this.props.id === -1
                    ? <p className="noSessionSelected">Please select an office hour from the calendar.</p>
                    : <SessionDataQuery
                        query={GET_SESSION_DATA}
                        variables={{ sessionId: this.props.id, courseId: this.props.courseId }}
                        pollInterval={5000}
                    >
                        {({ loading, data, error }) => {
                            if (error) { return <h1>ERROR</h1>; }
                            if (!data || !data.sessionBySessionId) { return <div>Loading...</div>; }
                            return (
                                <React.Fragment>
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
                                            myUserId={data.apiGetCurrentUser.nodes[0].
                                                courseUsersByUserId.nodes[0].userId}
                                        />
                                    </div>
                                </React.Fragment>
                            );
                        }}
                    </SessionDataQuery>
                }
            </section>
        );
    }
}

export default SessionView;
