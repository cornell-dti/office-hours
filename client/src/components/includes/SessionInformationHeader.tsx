import * as React from 'react';
import Moment from 'react-moment';
import { Icon } from 'semantic-ui-react';

import people from '../../media/people.svg';

const SessionInformationHeader = (props: {
    session: FireSession;
    course?: FireCourse;
    callback: Function;
    userId: string;
    isDesktop: boolean;
}) => {
    const handleBackClick = () => {
        props.callback();
    };

    const { session } = props; // TODO
    // const tas = session.sessionTasBySessionId.nodes;
    // const unresolvedQuestions = session.questionsBySessionId.nodes.filter((q) => q.status === 'unresolved');
    // const userQuestions = unresolvedQuestions.filter((q) => q.userByAskerId.userId === this.props.myUserId);
    // const numAhead = userQuestions.length === 0 ? unresolvedQuestions.length :
    //     unresolvedQuestions.filter((q) => q.timeEntered <= userQuestions[0].timeEntered).length - 1;

    if (props.isDesktop) {
        return (
            <header className="DesktopSessionInformationHeader">
                <div className="Picture">
                    <img src="/placeholder.png" alt="T. A. Avatar" />
                    {/* <img src={{tas[0] ? tas[0].userByUserId.computedAvatar : '/placeholder.png'} /> */}
                </div>
                <div className="Details">
                    <p className="Location">{`${session.building} ${session.room}`}</p>
                    <Moment unix date={session.startTime.seconds} interval={0} format="h:mm A" />
                    <Moment unix date={session.endTime.seconds} interval={0} format=" - h:mm A" />
                    <p className="Date">
                        <Icon name="calendar alternate outline" />
                        <Moment unix date={session.startTime.seconds} interval={0} format="dddd, MMM D" />
                    </p>
                    <p>
                        {session.title || (
                            <React.Fragment>
                                Held by
                                <span className="black">
                                    {/* {' ' + tas.map(ta => ta.userByUserId.computedName).join(' and ')} */}
                                </span>
                            </React.Fragment>
                        )}

                    </p>
                </div>
                <div className="QueueWrap">
                    <div className="QueueInfo">
                        <img src={people} alt="Number of people in the room" />
                        <p>
                            <span className="red">
                                0
                                {/* {numAhead + ' '} */}
                            </span>
                            ahead
                        </p>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="SessionInformationHeader">
            <div className="header">
                <p className="BackButton" onClick={handleBackClick}>
                    <i className="left" />
                    {(props.course && props.course.code) || ''}
                </p>
                <div className="CourseInfo">
                    <div className="CourseDetails">
                        <p className="Location">{`${session.building} ${session.room}`}</p>
                        <Moment unix date={session.startTime.seconds} interval={0} format="h:mm A" />
                        <Moment unix date={session.endTime.seconds} interval={0} format=" - h:mm A" />
                    </div>
                    <div className="Picture">
                        <img src="/placeholder.png" alt="T. A. Avatar" />
                        {/* <img src={tas[0] ? tas[0].userByUserId.computedAvatar : '/placeholder.png'} /> */}
                    </div>
                </div>
            </div>
            <div className="MoreInformation">
                <hr />
                <div className="QueueInfo">
                    <img src={people} alt="Number of people in the room" />
                    <p>
                        <span className="red">
                            0
                            {/* {numAhead + ' '} */}
                        </span>
                        in queue
                    </p>
                </div>
                <div className="OfficeHourInfo">
                    <div className="OfficeHourDate">
                        <p>
                            <Icon name="calendar" />
                            <Moment unix date={session.startTime.seconds} interval={0} format="dddd, D MMM" />
                        </p>
                    </div>
                    <p>
                        {session.title || (
                            <React.Fragment>
                                Held by
                                <span className="black">
                                    {/* {' ' + tas.map(ta => ta.userByUserId.computedName).join(' and ')} // TODO */}
                                </span>
                            </React.Fragment>
                        )}
                    </p>
                </div>
            </div>
        </header>
    );
};
export default SessionInformationHeader;
