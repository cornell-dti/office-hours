import * as React from 'react';
import Moment from 'react-moment';
import { Redirect } from 'react-router';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

type InputProps = {
    sessionId: number,
    data: {
        sessionBySessionId?: {
            sessionTasBySessionId: {
                nodes: [TANode]
            },
            building: string,
            room: string,
            courseByCourseId: {
                name: string
            }
            sessionSeryBySessionSeriesId: {
                building: string,
                room: string,
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
            building
            room
            startTime
            courseByCourseId {
                name
            }
            endTime
            questionsBySessionId {
                nodes {
                    timeResolved
                }
            }
            sessionSeryBySessionSeriesId {
                building
                room
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
    options: ({ sessionId }) => ({
        variables: { sessionId: sessionId }
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
        var location = 'Unknown';
        if (this.props.data.sessionBySessionId) {
            var session = this.props.data.sessionBySessionId;

            var tas: string[] = [];
            session.sessionTasBySessionId.nodes.forEach(ta => {
                tas.push(ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName);
            });
            if (session.sessionSeryBySessionSeriesId) {
                if (tas.length === 0) {
                    session.sessionSeryBySessionSeriesId.sessionSeriesTasBySessionSeriesId.nodes.forEach(ta => {
                        tas.push(ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName);
                    });
                }

                location = session.sessionSeryBySessionSeriesId.building +
                    ' ' + session.sessionSeryBySessionSeriesId.room;
            }
            if (session.building !== null) {
                location = session.building + ' ' + session.room;
            }

            var queueLength = 0;
            session.questionsBySessionId.nodes.forEach(question => {
                if (question.timeResolved === null) {
                    queueLength += 1;
                }
            });

            return (
                <div className="SessionInformationHeader">
                    <div className="header">
                        <button className="CloseButton" type="submit" onClick={this.handleOnClick}>
                            X
                        </button>
                        <div className="CourseInfo">
                            <span className="CourseNum">
                                {
                                    session.courseByCourseId && session.courseByCourseId.name ||
                                    session.sessionSeryBySessionSeriesId.courseByCourseId.name
                                }
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
                                    <p><Moment date={session.startTime} interval={0} format={'hh:mm A'} />
                                        &nbsp;-&nbsp;
                                        <Moment date={session.endTime} interval={0} format={'hh:mm A'} /></p>
                                    <p><Moment date={session.startTime} interval={0} format={'dddd, D MMM'} /></p>
                                </div>
                                <div className="OfficeHourLocation">
                                    {location || 'Unknown'}
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
