import * as React from 'react';
import Moment from 'react-moment';
import { Icon } from 'semantic-ui-react';

import people from '../../media/people.svg';
import { useSessionQuestions, useSessionTAs } from '../../firehooks';
import { computeNumberAhead } from '../../utilities/questions';

type Props = {
    session: FireSession;
    course: FireCourse;
    callback: Function;
    user: FireUser;
    isDesktop: boolean;
};

const SessionInformationHeader = ({ session, course, callback, user, isDesktop }: Props) => {
    const tas = useSessionTAs(course, session);
    const numAhead = computeNumberAhead(
        useSessionQuestions(session.sessionId, user.roles[course.courseId] !== undefined), user.userId
    );

    if (isDesktop) {
        return (
            <header className="DesktopSessionInformationHeader" >
                <div className="Picture">
                    <img
                        src={tas[0] ? tas[0].photoUrl : '/placeholder.png'}
                        alt={tas[0]
                            ? `${tas[0].firstName} ${tas[0].lastName}'s Photo URL`
                            : 'Placeholder photo url'}
                    />
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
                        <img src={people} alt="number of people" />
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
                <p className="BackButton" onClick={() => callback()}>
                    <i className="left" />
                    {course.code}
                </p>
                <div className="CourseInfo">
                    <div className="CourseDetails">
                        <p className="Location">{session.building + ' ' + session.room}</p>
                        <Moment date={session.startTime.toDate()} interval={0} format={'h:mm A'} />
                        <Moment date={session.endTime.toDate()} interval={0} format={' - h:mm A'} />
                    </div>
                    <div className="Picture">
                        <img
                            src={tas[0] ? tas[0].photoUrl : '/placeholder.png'}
                            alt={tas[0]
                                ? `${tas[0].firstName} ${tas[0].lastName}'s Photo URL`
                                : 'Placeholder photo url'}
                        />
                    </div>
                </div>
            </div>
            <div className="MoreInformation">
                <hr />
                <div className="QueueInfo">
                    <img src={people} alt="number of people" />
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
                            <Moment date={session.startTime.toDate()} interval={0} format={'dddd, D MMM'} />
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
};
export default SessionInformationHeader;
