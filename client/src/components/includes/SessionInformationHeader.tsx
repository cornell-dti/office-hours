import * as React from 'react';
import Moment from 'react-moment';
import { Redirect } from 'react-router';
import { Icon } from 'semantic-ui-react';

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
    options: ({ match }) => ({
        variables: { sessionId: match.params.sessionId }
    })
});

class SessionInformationHeader extends React.Component<ChildProps<InputProps, Response>> {
    state: {
        redirect: boolean;
    };

<<<<<<< HEAD
    props: {
        courseName: string,
        taName: string,
        queueSize: number,
        date: string,
        time: string,
        location: string,
        picture: string
    };

    constructor(props: {}) {
=======
    constructor(props: ChildProps<InputProps, Response>) {
>>>>>>> db192cf10bf6e709cf127d33601ae47a8530ccc0
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

<<<<<<< HEAD
        return (
            <div className="SessionInformationHeader">
                <div className="header">
                    <p className="BackButton" onClick={this.handleOnClick}><i className="left"></i> {this.props.courseName}</p>
                    <div className="CourseInfo">
                        <div className="CourseDetails">
                            <p className="Location">{this.props.location}</p>
                            <p>{this.props.time}</p>
                        </div>
                        <div className="Picture">
                            <img src={this.props.picture}/>
                        </div>
                    </div>
                </div>
                <div className="MoreInformation">
                    <hr/>
                    <div className="QueueInfo">
                        <Icon name="users"/>
                        <p><span className="red">{this.props.queueSize}</span> ahead</p>
                    </div>
                    <div className="OfficeHourInfo">
                        <div className="OfficeHourDate">
                            <p><Icon name="calendar"/> {this.props.date}</p>
=======
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
>>>>>>> db192cf10bf6e709cf127d33601ae47a8530ccc0
                        </div>
                        <p>Held by <span className="black">{this.props.taName}</span></p>
                    </div>
                </div>
            );
        } else {
            return ('');
        }

    }
}

<<<<<<< HEAD
export default SessionInformationHeader;
=======
export default withData(SessionInformationHeader);
>>>>>>> db192cf10bf6e709cf127d33601ae47a8530ccc0
