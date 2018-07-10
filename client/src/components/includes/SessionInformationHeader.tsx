import * as React from 'react';
import Moment from 'react-moment';
import { Icon } from 'semantic-ui-react';

const people = require('../../media/people.svg');
const avatar = require('../../media/userAvatar.svg');

class SessionInformationHeader extends React.Component {
    props: {
        session: AppSession,
        course: AppCourse,
        callback: Function,
        isDesktop: boolean,
    };

    handleBackClick = () => {
        this.props.callback();
    }

    render() {
        const session = this.props.session;
        if (this.props.isDesktop) {
            return (
                <header className="DesktopSessionInformationHeader" >
                    <div className="Picture">
                        <img src={session.sessionTasBySessionId.nodes[0].userByUserId.photoUrl || avatar} />
                    </div>
                    <div className="Details">
                        <p className="Location">{session.building + ' ' + session.room}</p>
                        <Moment date={session.startTime} interval={0} format={'h:mm A'} />
                        <Moment date={session.endTime} interval={0} format={' - h:mm A'} />
                        <p className="Date">
                            <Icon name="calendar" />
                            <Moment date={session.startTime} interval={0} format={'dddd, D MMM'} />
                        </p>
                        <p>Held by <span className="black">
                            {/* TODO: Better handle multiple TAs */}
                            {session.sessionTasBySessionId.nodes.map(ta =>
                                ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName + ' '
                            )}
                        </span></p>
                    </div>
                    <div className="QueueWrap">
                        <div className="QueueInfo">
                            <img src={people} />
                            <p>
                                <span className="red">
                                    {session.questionsBySessionId.nodes.filter((q) => q.status === 'unresolved').length}
                                </span>
                                in queue
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
                        {this.props.course.name}
                    </p>
                    <div className="CourseInfo">
                        <div className="CourseDetails">
                            <p className="Location">{session.building + ' ' + session.room}</p>
                            <Moment date={session.startTime} interval={0} format={'h:mm A'} />
                            <Moment date={session.endTime} interval={0} format={' - h:mm A'} />
                        </div>
                        <div className="Picture">
                            <img src={session.sessionTasBySessionId.nodes[0].userByUserId.photoUrl || avatar} />
                        </div>
                    </div>
                </div>
                <div className="MoreInformation">
                    <hr />
                    <div className="QueueInfo">
                        <img src={people} />
                        <p>
                            <span className="red">
                                {session.questionsBySessionId.nodes.filter((q) => q.status === 'unresolved').length}
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
                        <p>Held by <span className="black">
                            {/* TODO: Better handle multiple TAs */}
                            {session.sessionTasBySessionId.nodes.map(ta =>
                                ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName + ' '
                            )}
                        </span></p>
                    </div>
                </div>
            </header>
        );
    }
}
export default SessionInformationHeader;
