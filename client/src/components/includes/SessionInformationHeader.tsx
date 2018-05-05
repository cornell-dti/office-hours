import * as React from 'react';
import Moment from 'react-moment';
import { Icon } from 'semantic-ui-react';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

const people = require('../../media/people.svg');

type InputProps = {
    sessionId: number,
    callback: Function,
    isDesktop: boolean,
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

    handleBackClick = () => {
        this.props.callback();
    }

    render() {
        var queueLength = 0;

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
        if (this.props.isDesktop) {
            return (
                <header className="DesktopSessionInformationHeader" >
                    <div className="Picture">
                        <img
                            src={'https://i2.wp.com/puppypassionn.org/wp-content/' +
                                'uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1'}
                        />
                    </div>
                    <div className="Details">
                        <p className="Location">{location || 'Unknown'}</p>
                        <p>{session &&
                            <React.Fragment>
                                <Moment date={session.startTime} interval={0} format={'h:mm A'} />
                                <Moment date={session.endTime} interval={0} format={' - h:mm A'} />
                                <p className="Date">
                                    <Icon name="calendar" />
                                    <Moment date={session.startTime} interval={0} format={'dddd, D MMM'} />
                                </p>
                                <p>Held by <span className="black"> {tas.length > 0 && tas[0]} </span></p>
                            </React.Fragment>
                        }</p>
                    </div>
                    <div className="QueueWrap">
                        <div className="QueueInfo">
                            <img src={people} />
                            <p><span className="red">{queueLength}</span> ahead</p>
                        </div>
                    </div>
                </header>
            );
        }
        return (
            <header className="SessionInformationHeader" >
                <div className="header">
                    <p className="BackButton" onClick={this.handleBackClick}>
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
                            <p>{session &&
                                <React.Fragment>
                                    <Moment date={session.startTime} interval={0} format={'h:mm A'} />
                                    <Moment date={session.endTime} interval={0} format={' - h:mm A'} />
                                </React.Fragment>}</p>
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
                        <img src={people} />
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
            </header>
        );
    }
}
export default withData(SessionInformationHeader);
