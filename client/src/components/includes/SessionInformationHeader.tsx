import * as React from 'react';
import Moment from 'react-moment';
import { Icon } from 'semantic-ui-react';

const people = require('../../media/people.svg');

class SessionInformationHeader extends React.Component {
    props: {
        session: FireSession,
        course: FireCourse,
        callback: Function,
        myUserId?: string,
        isDesktop: boolean,
    };

    handleBackClick = () => {
        this.props.callback();
    }

    render() {
        const session = this.props.session;
        const tas: FireUser[] = []; // session.sessionTasBySessionId.nodes;

        const unresolvedQuestions: FireQuestion[] = [];
        // session.questionsBySessionId.nodes.filter((q) => q.status === 'unresolved');
        const userQuestions: FireQuestion[] = [];
        // unresolvedQuestions.filter((q) => q.userByAskerId.userId === this.props.myUserId);
        const numAhead = userQuestions.length === 0 ? unresolvedQuestions.length :
            unresolvedQuestions.filter((q) => q.timeEntered <= userQuestions[0].timeEntered).length - 1;

        if (this.props.isDesktop) {
            return (
                <header className="DesktopSessionInformationHeader" >
                    <div className="Picture">
                        <img src={tas[0] ? tas[0].photoUrl : '/placeholder.png'} />
                    </div>
                    <div className="Details">
                        <p className="Location">{session.building + ' ' + session.room}</p>
                        <Moment date={session.startTime.seconds * 1000} interval={0} format={'h:mm A'} />
                        <Moment date={session.endTime.seconds * 1000} interval={0} format={' - h:mm A'} />
                        <p className="Date">
                            <Icon name="calendar alternate outline" />
                            <Moment date={session.startTime.seconds * 1000} interval={0} format={'dddd, MMM D'} />
                        </p>
                        <p>{session.title || (<React.Fragment>
                            Held by
                                <span className="black">
                                {' ' + tas.map(ta => ta.firstName + ' ' + ta.lastName).join(' and ')}
                            </span>
                        </React.Fragment>)}</p>
                    </div>
                    <div className="QueueWrap">
                        <div className="QueueInfo">
                            <img src={people} />
                            <p>
                                <span className="red">
                                    {numAhead + ' '}
                                </span>
                                ahead
                            </p>
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
                        {this.props.course.code}
                    </p>
                    <div className="CourseInfo">
                        <div className="CourseDetails">
                            <p className="Location">{session.building + ' ' + session.room}</p>
                            <Moment date={session.startTime} interval={0} format={'h:mm A'} />
                            <Moment date={session.endTime} interval={0} format={' - h:mm A'} />
                        </div>
                        <div className="Picture">
                            <img src={tas[0] ? tas[0].photoUrl : '/placeholder.png'} />
                        </div>
                    </div>
                </div>
                <div className="MoreInformation">
                    <hr />
                    <div className="QueueInfo">
                        <img src={people} />
                        <p>
                            <span className="red">
                                {numAhead + ' '}
                            </span>
                            in queue
                        </p>
                    </div>
                    <div className="OfficeHourInfo">
                        <div className="OfficeHourDate">
                            <p><Icon name="calendar" />
                                <Moment date={session.startTime} interval={0} format={'dddd, D MMM'} />
                            </p>
                        </div>
                        <p>{session.title || (<React.Fragment>
                            Held by
                                <span className="black">
                                {' ' + tas.map(ta => ta.firstName + ' ' + ta.lastName).join(' and ')}
                            </span>
                        </React.Fragment>)}
                        </p>
                    </div>
                </div>
            </header>
        );
    }
}
export default SessionInformationHeader;
