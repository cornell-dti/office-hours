import * as React from 'react';
import { Redirect } from 'react-router';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

type InputProps = {
    match: {
        params: {
            sessionId: number,
        },
    },
    data: {
        sessionBySessionId?: {
            sessionTasBySessionId: {
                nodes: [TANode]
            },
            location: string,
            sessionSeryBySessionSeriesId: {
                courseByCourseId: {
                    name: string
                },
                sessionSeriesTasBySessionSeriesId: {
                    nodes: [TANode]
                }
            },
            questionsBySessionId: {
                nodes: [{
                    timeResolved: Date
                }]
            },
            startTime: Date,
            endTime: Date,
        },
    },
};

const QUERY = gql`
    query getHeaderInformation($sessionId: Int!) {
        sessionBySessionId(sessionId: $sessionId) {
            location
            startTime
            endTime
            questionsBySessionId {
                nodes {
                    timeResolved
                }
            }
            sessionSeryBySessionSeriesId {
            courseByCourseId {
                name
            }
            sessionSeriesTasBySessionSeriesId {
                nodes {
                    userByUserId {
                        firstName
                        lastName
                    }
                }
            }
            }
            sessionTasBySessionId {
            nodes {
                userByUserId {
                    firstName
                    lastName
                }
            }
            }
        }
    }
`;

const withData = graphql<Response, InputProps>(QUERY, {
    options: ({ match }) => ({
        variables: { sessionId: match.params.sessionId }
    })
});

class SessionInformationHeader extends React.Component<ChildProps<InputProps, Response>> {
    state: {
        redirect: boolean;
    };

    constructor(props: ChildProps<InputProps, Response>) {
        super(props);
        this.state = {
            redirect: false
        };
    }

    handleOnClick = () => {
        this.setState({
            redirect: true
        });
    }

    render() {
        if (this.state.redirect) {
            return <Redirect push={true} to="/calendar" />;
        }
        if (this.props.data.sessionBySessionId !== null && this.props.data.sessionBySessionId !== undefined) {

            var session = this.props.data.sessionBySessionId;

            var tas: string[] = [];
            session.sessionTasBySessionId.nodes.forEach(ta => {
                tas.push(ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName);
            });
            if (tas.length === 0) {
                session.sessionSeryBySessionSeriesId.sessionSeriesTasBySessionSeriesId.nodes.forEach(ta => {
                    tas.push(ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName);
                });
            }

            var queueLength = 0;
            session.questionsBySessionId.nodes.forEach(question => {
                if (question.timeResolved === null) {
                    queueLength += 1;
                }
            });

            var options = {
                hour: '2-digit',
                minute: '2-digit',
            };

            return (
                <div className="SessionInformationHeader">
                    <div className="header">
                        <button className="CloseButton" type="submit" onClick={this.handleOnClick}>
                            X
                        </button>
                        <div className="CourseInfo">
                            <span className="CourseNum">
                                {session.sessionSeryBySessionSeriesId.courseByCourseId.name}
                            </span>
                            {tas[0]}
                        </div>
                        <div>
                            <div className="QueueInfo">
                                <div className="QueueTotal">
                                    {queueLength}
                                </div>
                                <div>in queue</div>
                            </div>
                            <div className="OfficeHourInfo">
                                <div className="OfficeHourTime">
                                    <p>{new Date(session.startTime).toLocaleTimeString('en-us', options)}</p>
                                    <p>{new Date(session.endTime).toLocaleTimeString('en-us', options)}</p>
                                </div>
                                <div className="OfficeHourLocation">
                                    {session.location || 'Unknown'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return ('');
        }

    }
}

export default withData(SessionInformationHeader);
