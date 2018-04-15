import * as React from 'react';
import Moment from 'react-moment';
import { Redirect } from 'react-router';
import { Icon } from 'semantic-ui-react';

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
        var queueLength = 0;

        if (this.state.redirect) {
            return <Redirect push={true} to="/calendar/1" />;
        }

        var location = 'Unknown';
        var tas: string[] = [];
        var session = null;

        if (this.props.data.sessionBySessionId) {
            session = this.props.data.sessionBySessionId;

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

            session.questionsBySessionId.nodes.forEach(question => {
                if (question.timeResolved === null) {
                    queueLength += 1;
                }
            });
        }

        return (
            <div className="SessionInformationHeader" >
                <div className="header">
                    <p className="BackButton" onClick={this.handleOnClick}>
                        <i className="left" />
                        {
                            session &&
                            session.courseByCourseId && session.courseByCourseId.name ||
                            session &&
                            session.sessionSeryBySessionSeriesId.courseByCourseId.name
                        }
                    </p>
                    <div className="CourseInfo">
                        <div className="CourseDetails">
                            <p className="Location">{location || 'Unknown'}</p>
                            <p>{session && <Moment date={session.startTime} interval={0} format={'hh:mm A'} />}</p>
                        </div>
                        <div className="Picture">
                            <img
                                src={'https://i2.wp.com/puppypassionn.org/wp-content/' +
                                    'uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1'}
                            />
                        </div>
                    </div>
                </div>
                <div className="MoreInformation">
                    <hr />
                    <div className="QueueInfo">
                        <Icon name="users" />
                        <p><span className="red">{queueLength}</span> ahead</p>
                    </div>
                    <div className="OfficeHourInfo">
                        <div className="OfficeHourDate">
                            <p><Icon name="calendar" />
                                {
                                    session &&
                                    <Moment
                                        date={session.startTime}
                                        interval={0}
                                        format={'dddd, D MMM'}
                                    />
                                }
                            </p>
                        </div>
                        <p>Held by <span className="black"> {tas.length > 0 && tas[0]} </span></p>
                    </div>
                </div>
            </div >
        );
    }
}
export default withData(SessionInformationHeader);
