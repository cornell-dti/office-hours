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

const getPercentage = (proportion: number, total: number) => {
    if (total === 0){
        return "- %";
    }
    const pct = proportion / total * 100;
    return pct.toFixed(1) + "%";
}

const formatAvgTime = (rawTimeSecs: number) => {
    const timeSecs = Math.floor(rawTimeSecs);
    const timeMins = Math.floor(timeSecs / 60);
    const timeHours = Math.floor(timeMins / 60);
    const timeDispSecs = timeSecs - timeMins * 60;
    const timeDispMins = timeMins - timeHours * 60;
    if (isNaN(timeSecs)){
        return "No information available";
    }
    if (timeMins === 0){
        return timeDispSecs + " s"
    } if (timeHours === 0){
        return timeDispMins + " mins " + timeDispSecs + " s"
    } 
    return timeHours + " h " + timeDispMins + " mins"
    
}

const SessionInformationHeader = ({ session, course, callback, user, isDesktop }: Props) => {
    const tas = useSessionTAs(course, session);
    const numAhead = computeNumberAhead(
        useSessionQuestions(session.sessionId, user.roles[course.courseId] !== undefined), user.userId
    );

    const pctAssigned = getPercentage(session.assignedQuestions, session.totalQuestions);
    const pctResolved = getPercentage(session.resolvedQuestions, session.totalQuestions);
    const avgWaitTime = formatAvgTime(session.totalWaitTime / session.assignedQuestions);
    const avgResolveTime = formatAvgTime(session.totalResolveTime / session.resolvedQuestions);

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
                    {'building' in session ?
                        <p className="Location">{
                            [session.building, session.room]
                                .map(s => s || '')
                                .join(' ')}</p> : session.modality === "virtual" ? <p className="Location">Online</p> : 
                            <p className="Location">Discussion</p>}
                    <Moment date={session.startTime.seconds * 1000} interval={0} format={'h:mm A'} />
                    <Moment date={session.endTime.seconds * 1000} interval={0} format={' - h:mm A'} />
                    <p className="Date">
                        <Icon name="calendar alternate outline" />
                        <Moment date={session.startTime.seconds * 1000} interval={0} format={'dddd, MMM D'} />
                        {session.modality === "review" ? <div>
                            <Icon name="video" />
                            <a href={session.link} target="_blank" rel="noopener noreferrer">Zoom meeting link</a>
                        </div> : <></>}
                    </p>
                    
                    <p>
                        {session.assignedQuestions} / {session.totalQuestions} Questions Assigned ({pctAssigned}) <br/>
                        {session.resolvedQuestions} / {session.totalQuestions} Questions Resolved ({pctResolved}) <br/>
                        Average Wait Time: {avgWaitTime} <br/>
                        Average Resolve Time: {avgResolveTime} <br/>
                    </p>
                    <p className="Title">{session.title || (<>
                        Held by
                        <span className="black">
                            {' ' + tas.map(ta => ta.firstName + ' ' + ta.lastName).join(', ')}
                        </span>
                    </>)}</p>
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
                        {'building' in session ? <span>
                            <p className="Location">{`${session.building} ${session.room}`}</p>
                        </span> : <span>Online</span>}
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
                    <p>{session.title || (<>
                        Held by
                        <span className="black">
                            {' ' + tas.map(ta => ta.firstName + ' ' + ta.lastName).join(' and ')}
                        </span>
                    </>)}
                    </p>
                </div>
            </div>
        </header>
    );
};
export default SessionInformationHeader;
