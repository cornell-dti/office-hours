import * as React from 'react';

import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_SESSION_DATA = gql`
query getDataForSession($sessionId: Int!) {
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

interface Variables {
    sessionId: number;
}

class SessionDataQuery extends Query<SessionData, Variables> { }

class SessionView extends React.Component {

    props: {
        id: number,
        isDesktop: boolean,
        backCallback: Function,
        joinCallback: Function,
    };

    render() {
        return (
            <section className={'StudentSessionView '}>
                {this.props.id === -1 ?
                    <p className="noSessionSelected">Please Select an Office Hour from the Calendar.</p>
                    :
                    <SessionDataQuery
                        query={GET_SESSION_DATA}
                        variables={{ sessionId: this.props.id }}
                    >
                        {({ loading, data, error }) => {
                            if (error) { return <h1>ERROR</h1>; }
                            if (!data || !data.sessionBySessionId) { return <div>Loading...</div>; }

                            return (
                                <React.Fragment>
                                    <SessionInformationHeader
                                        session={data.sessionBySessionId}
                                        callback={this.props.backCallback}
                                        isDesktop={this.props.isDesktop}
                                    />
                                    <div className="splitQuestions">
                                        <SessionQuestionsContainer
                                            isTA={false}
                                            questions={data.sessionBySessionId.questionsBySessionId.nodes}
                                            handleJoinClick={this.props.joinCallback}
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
