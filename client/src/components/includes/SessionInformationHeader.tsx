import * as React from 'react';
import Moment from 'react-moment';
import { Icon } from 'semantic-ui-react';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

const people = require('../../media/people.svg');
const avatar = require('../../media/userAvatar.svg');

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
                code: string
            },
            questionsBySessionId: {
                nodes: [{
                    timeAddressed: Date
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
                code
            }
            endTime
            questionsBySessionId {
                nodes {
                    timeAddressed
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

const withData = graphql<InputProps, Response>(QUERY, {
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
        var taPhotoUrl = avatar;
        var tas: string[] = [];
        var session = null;

        if (this.props.data.sessionBySessionId) {
            session = this.props.data.sessionBySessionId;

            session.sessionTasBySessionId.nodes.forEach(ta => {
                tas.push(ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName);
            });

            location = session.building + ' ' + session.room;

            session.questionsBySessionId.nodes.forEach(question => {
                if (question.timeAddressed === null) {
                    queueLength += 1;
                }
            });

            // TODO: won't work for multiple TAs
            if (session.sessionTasBySessionId.nodes[0].userByUserId.photoUrl) {
                taPhotoUrl = session.sessionTasBySessionId.nodes[0].userByUserId.photoUrl;
            }
        }
        if (this.props.isDesktop) {
            return (
                <header className="DesktopSessionInformationHeader" >
                    <div className="Picture">
                        <img
                            src={taPhotoUrl}
                        />
                    </div>
                    <div className="Details">
                        <p className="Location">{location || 'Unknown'}</p>
                        {session &&
                            <React.Fragment>
                                <Moment date={session.startTime} interval={0} format={'h:mm A'} />
                                <Moment date={session.endTime} interval={0} format={' - h:mm A'} />
                                <p className="Date">
                                    <Icon name="calendar" />
                                    <Moment date={session.startTime} interval={0} format={'dddd, D MMM'} />
                                </p>
                                <p>Held by <span className="black"> {tas.length > 0 && tas[0]} </span></p>
                            </React.Fragment>
                        }
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
                            session.courseByCourseId && session.courseByCourseId.code
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
                                src={taPhotoUrl}
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
