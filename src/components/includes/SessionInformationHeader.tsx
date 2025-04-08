import * as React from 'react';
import Moment from 'react-moment';
import { Icon } from 'semantic-ui-react';

import { Grid, Switch } from '@material-ui/core';
import { connect } from 'react-redux';
import { pauseSession } from '../../firebasefunctions/session';
import users from '../../media/users.svg'
import chalkboard from '../../media/chalkboard-teacher.svg'
import hourglass from '../../media/hourglass-half.svg'

import zoom from '../../media/zoom.svg';
import closeZoom from '../../media/closeZoom.svg';

import editZoomLink from '../../media/editZoomLink.svg';
import { useSessionQuestions, useSessionTAs } from '../../firehooks';
import { computeNumberAhead } from '../../utilities/questions';
import JoinErrorMessage from './JoinErrorMessage';
import { RootState } from '../../redux/store';

type Props = {
    session: FireSession;
    course: FireCourse;
    callback: () => void;
    user: FireUser;
    isDesktop: boolean;
    isTa: boolean;
    virtualLocation?: string;
    assignedQuestion?: FireOHQuestion;
    onUpdate: (virtualLocation: string) => void;
    myQuestion: FireQuestion | null;
    isOpen: boolean;
    questions: readonly FireQuestion[];
    isPaused: boolean | undefined;
};

const formatAvgTime = (rawTimeSecs: number) => {
    const timeSecs = Math.floor(rawTimeSecs);
    const timeMins = Math.floor(timeSecs / 60);
    const timeHours = Math.floor(timeMins / 60);
    const timeDispSecs = timeSecs - timeMins * 60;
    const timeDispMins = timeMins - timeHours * 60;
    if (isNaN(timeSecs)) {
        return 'No information available';
    }
    if (timeMins === 0) {
        return timeDispSecs + ' s';
    }
    if (timeHours === 0) {
        return timeDispMins + ' mins ' + timeDispSecs + ' s';
    }
    return timeHours + ' h ' + timeDispMins + ' mins';
};

const formatEstimatedTime = (waitTimeSecs: number, currentTime: Date) => {
    const currMins = currentTime.getMinutes();
    const currHour = currentTime.getHours();

    const timeSecs = Math.floor(waitTimeSecs);
    const timeMins = Math.floor(timeSecs / 60);
    const timeHours = Math.floor(timeMins / 60);

    const timeDispMins = timeMins - timeHours * 60;

    let amPm = " am";
    if ((currHour + timeHours) % 24 >= 12) {
        amPm = " pm"
    }
    let totalHour = (currHour + timeHours) % 12;
    const totalMins = (currMins + timeDispMins) % 60;

    if (currHour + timeHours >= 24) {
        return " (No estimate available) "
    }
    if (currMins + timeDispMins >= 60) {
        totalHour = (totalHour + 1) % 12;
    }
    if (totalMins < 10) {
        return ' (' + totalHour + ':0' + totalMins + amPm + ') ';
    }
    return ' (' + totalHour + ':' + totalMins + amPm + ') ';
}

const SessionInformationHeader = ({
    session,
    course,
    callback,
    user,
    isDesktop,
    isTa,
    virtualLocation,
    assignedQuestion,
    onUpdate,
    myQuestion,
    isOpen,
    questions,
    isPaused,
}: Props) => {
    const tas = useSessionTAs(course, session);
    const numAhead = computeNumberAhead(
        useSessionQuestions(session.sessionId, user.roles[course.courseId] !== undefined),
        user.userId
    );



    let dynamicPosition = questions.findIndex(question => question.askerId === myQuestion?.askerId) + 1

    if (dynamicPosition === 0) {
        dynamicPosition = questions.length + 1
    }

    const avgWaitTime =
        formatAvgTime((session.totalWaitTime / session.assignedQuestions)
            * (isTa ? 1 : dynamicPosition));

    const today = new Date();
    const esimatedTime = formatEstimatedTime((session.totalWaitTime / session.assignedQuestions)
        * (isTa ? 1 : dynamicPosition), today)

    const [zoomLinkDisplay, setZoomLinkDisplay] = React.useState('hide');
    const [zoomLink, setZoomLink] = React.useState('');
    const [showError, setShowError] = React.useState(false);
    const [showErrorMessage, setShowErrorMessage] = React.useState('');

    React.useEffect(() => {
        if (typeof virtualLocation === 'string' && virtualLocation.trim() !== '') {
            setZoomLink(virtualLocation);
            setZoomLinkDisplay('saved');
        }
    }, [virtualLocation]);

    const closeZoomLink = () => {
        if (typeof virtualLocation === 'string' && virtualLocation.trim() !== '') {
            setZoomLink(virtualLocation);
            setZoomLinkDisplay('saved');
        } else {
            setZoomLink('');
            setZoomLinkDisplay('hide');
        }
    };

    const saveZoomLink = () => {
        onUpdate(zoomLink);
        if (zoomLink === '') {
            setZoomLinkDisplay('hide');
        } else {
            setZoomLinkDisplay('saved');
        }
    };

    const handlePause = () => {
        pauseSession(session, !session.isPaused);
    }

    const activateError = () => {
        setShowError(true);
        let message = "";
        if(!myQuestion) {
            if(isOpen) {
                message = 'Please fill out the "Join the Queue" form first';
            } else {
                message = 'This queue has closed';
            }
        } else if((session.modality === 'virtual' || 
            session.modality === 'hybrid') && 
            !(typeof session.useTALink === 'undefined' || 
            session.useTALink === false) && 
            !session.TALink) {
            message = 'A professor has not set a link for this office hour. Please reference the course website.';
        } else if(assignedQuestion && !assignedQuestion.answererLocation) {
            message = 'Please wait for the TA to update their location';
        } else if(avgWaitTime === 'No information available') {
            message = 'Please wait for your turn to join the Zoom call';
        } else {
            message = `Please wait for your turn to join the Zoom call (estimated wait time: ${avgWaitTime})`;
        }
        setShowErrorMessage(message);
    }

    return isDesktop ? (
        <header className="DesktopSessionInformationHeader">
    <Grid container spacing={2} style={{ alignItems: 'stretch' }}>
            {/* Left Column (Boxes 1 & 2) */}
      <Grid item xs={12} md={4}>
        <Grid container direction="column">
            <Grid item style={{ 
                flex: 2 ,
                alignItems: 'flex-start', // Align children to the top (left if textAlign is set)
                justifyContent: 'flex-start' // Align items to the left horizontally
         
            }}>
                    <div className="LeftInformationHeader" style = {{ textAlign: 'left', width: '100%'}}>                     
                                {'building' in session ? (
                                    <p className="Location">
                                        {[session.building, session.room].map(s => s || '').join(' ')}
                                    </p>
                                ) : session.modality === 'virtual' ? (
                                    <p className="Location">Online</p>
                                ) : (
                                    <p className="Location">Discussion</p>
                                )}

                                <p className="Title">
                                    {session.title || (
                                        <>
                                            Held by
                                            <span className="black">
                                                {' ' +
                                                    tas
                                                        .map(ta => ta.firstName + ' ' + ta.lastName)
                                                        .join(', ')}
                                            </span>
                                        </>
                                    )}
                                    <br />
                                </p> 
                               
                                <p className="Date">
                                    <Icon name="calendar alternate outline" />
                                    <Moment
                                        date={session.startTime.seconds * 1000}
                                        interval={0}
                                        format={'dddd, MMM D'}
                                    />
                                    <br />
                                    <Moment
                                    date={session.startTime.seconds * 1000}
                                    interval={0}
                                    format={'h:mm A'}
                                    />
                                    <Moment
                                        date={session.endTime.seconds * 1000}
                                        interval={0}
                                        format={' - h:mm A'}
                                    />
                                </p>
                         </div>
            </Grid>
            <Grid item style={{ display: 'flex', flex: 1 }}>
                        <div className="QueueInfo">
                        <p>
                        <span className="blue">{tas.length + ' TAs '}</span>
                                assigned to this office hour
                         </p>
                         </div>

            </Grid>
        </Grid>
       </Grid>                                    
      <Grid item xs={12} md={8} spacing={2} style = {{display: 'flex', flex: 3}}>

                            <div className="QueueInfo">
                                    <Grid container direction="row" justifyContent="center" alignItems={'center'}>
                                        <Grid item xs={2}>
                                            <img src={users} alt="number of people" />
                                        </Grid>
                                        <Grid item xs={10}>
                                            <p>
                                                <span className="red">{numAhead + ' students '}</span> ahead
                                            </p>
                                        </Grid>
                                    </Grid>
                                {tas.length > 0 &&
                                    <div className="OneQueueInfo">
                                        <Grid container direction="row" justifyContent="center" alignItems={'center'}>
                                            <Grid item xs={2}>
                                                <img src={chalkboard} alt="number of people" />
                                            </Grid>
                                            <Grid item xs={10}>
                                                <p>
                                                    <span className="blue">{tas.length + ' TAs '}</span>
                                                    assigned to this office hour
                                                </p>
                                            </Grid>
                                        </Grid>
                                    </div>
                                }
                                <div className="OneQueueInfo">
                                    <Grid container direction="row" justifyContent="center" alignItems={'center'}>
                                        <Grid item xs={2}>
                                            <img src={hourglass} alt="time" />
                                        </Grid>
                                        <Grid item xs={10}>
                                            {avgWaitTime !== 'No information available' ? (
                                                <p>
                                                    <span className="blue">{avgWaitTime + ' ' + esimatedTime}</span>

                                                    estimated wait time
                                                </p>
                                            ) : (
                                                <p className="blue">{avgWaitTime}</p>
                                            )}
                                        </Grid>
                                    </Grid>
                                </div>
                                <div className="OneQueueInfo">
                                    {isTa && isOpen &&
                                        (<Grid container direction="row" justifyContent="center" alignItems={'center'}>
                                            <Grid item xs={2}>
                                                <Switch 
                                                    className="closeQueueSwitch" 
                                                    checked={!isPaused} 
                                                    onChange={handlePause} 
                                                    color="primary" 
                                                />
                                            </Grid>
                                            <Grid item xs={10}>
                                                <p>{`Queue is ${isPaused ? "closed" : "open"}`} </p>
                                            </Grid>
                                        </Grid>)}
                                </div>
                                </div>

      </Grid>
    </Grid>
       </header>
    ) : (
        <header className="SessionInformationHeader">
            <div className="header">
                <p className="BackButton" onClick={() => callback()}>
                    <i className="left" />
                    {course.code}
                </p>
                <div className="CourseInfo">
                    <div className="CourseDetails">
                        {'building' in session ? (
                            <span>
                                <p className="Location">{`${session.building} ${session.room}`}</p>
                            </span>
                        ) : (
                            <span>Online</span>
                        )}
                        <Moment date={session.startTime.toDate()} interval={0} format={'h:mm A'} />
                        <Moment date={session.endTime.toDate()} interval={0} format={' - h:mm A'} />
                    </div>
                    <div className="Picture">
                        <img
                            src={tas[0] ? tas[0].photoUrl : '/placeholder.png'}
                            alt={
                                tas[0]
                                    ? `${tas[0].firstName} ${tas[0].lastName}'s Photo URL`
                                    : 'Placeholder photo url'
                            }
                        />
                    </div>
                </div>
            </div>
            <div className="MoreInformation">
                <hr />
                <div className="QueueInfo">
                    <img src={users} alt="number of people" />
                    <p>
                        <span className="red">{numAhead + 'students '}</span>
                        in queue
                    </p>
                </div>
                <div className="OfficeHourInfo">
                    <div className="OfficeHourDate">
                        <p>
                            <Icon name="calendar" />
                            <Moment date={session.startTime.toDate()} interval={0} format={'dddd, D MMM'} />
                        </p>
                    </div>
                    <p>
                        {session.title || (
                            <>
                                Held by
                                <span className="black">
                                    {' ' + tas.map(ta => ta.firstName + ' ' + ta.lastName).join(' and ')}
                                </span>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </header>
    );
};

SessionInformationHeader.defaultProps = {
    virtualLocation: undefined,
    assignedQuestion: undefined,
};

const mapStateToProps = (state: RootState) => ({
    user: state.auth.user
})

export default connect(mapStateToProps, {})(SessionInformationHeader);
