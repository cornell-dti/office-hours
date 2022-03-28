import * as React from 'react';
import Moment from 'react-moment';
import { Icon } from 'semantic-ui-react';

import { Grid } from '@material-ui/core';
import { connect } from 'react-redux';
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
    callback: Function;
    user: FireUser;
    isDesktop: boolean;
    isTa: boolean;
    virtualLocation?: string;
    assignedQuestion?: FireOHQuestion;
    onUpdate: (virtualLocation: string) => void;
    myQuestion: FireQuestion | null;
    isOpen: boolean;
    questions: readonly FireQuestion[];
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
    questions
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

    return isDesktop ? (
        <header className="DesktopSessionInformationHeader">
            <Grid container direction="row" justify="center" alignItems={'stretch'} spacing={3}>
                <Grid container item lg={7} md={7} xs={12} justify="center">
                    <div className="LeftInformationHeader">
                        <Grid container direction="row">
                            <Grid container item lg={4} md={5} xs={4} className="Picture">
                                <img
                                    src={tas[0] ? tas[0].photoUrl : '/placeholder.png'}
                                    alt={
                                        tas[0]
                                            ? `${tas[0].firstName} ${tas[0].lastName}'s Photo URL`
                                            : 'Placeholder photo url'
                                    }
                                />
                            </Grid>
                            <Grid container item lg={8} md={7} xs={8} className="Details">
                                {'building' in session ? (
                                    <p className="Location">
                                        {[session.building, session.room].map(s => s || '').join(' ')}
                                    </p>
                                ) : session.modality === 'virtual' ? (
                                    <p className="Location">Online</p>
                                ) : (
                                    <p className="Location">Discussion</p>
                                )}
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
                                <p className="Date">
                                    <Icon name="calendar alternate outline" />
                                    <Moment
                                        date={session.startTime.seconds * 1000}
                                        interval={0}
                                        format={'dddd, MMM D'}
                                    />
                                </p>

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
                            </Grid>
                        </Grid>
                    </div>
                </Grid>

                <Grid container item lg={5} md={5} xs={12} justify="center">
                    <Grid
                        container
                        direction="column"
                        justify="space-evenly"
                        alignItems={'stretch'}
                        spacing={2}
                    >
                        <Grid container item>
                            <div className="QueueInfo">
                                <div className="OneQueueInfo">
                                    <Grid container direction="row" justify="center" alignItems={'center'}>
                                        <Grid item xs={2}>
                                            <img src={users} alt="number of people" />
                                        </Grid>
                                        <Grid item xs={10}>
                                            <p>
                                                <span className="red">{numAhead + ' students '}</span> ahead
                                            </p>
                                        </Grid>
                                    </Grid>
                                </div>
                                <div className="OneQueueInfo">
                                    <Grid container direction="row" justify="center" alignItems={'center'}>
                                        <Grid item xs={2}>
                                            <img src={chalkboard} alt="number of people" />
                                        </Grid>
                                        <Grid item xs={10}>
                                            <p>
                                                <span className="blue">{tas.length + ' TAs '}</span>
                                                helping students now
                                            </p>
                                        </Grid>
                                    </Grid>
                                </div>
                                <div className="OneQueueInfo">
                                    <Grid container direction="row" justify="center" alignItems={'center'}>
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
                            </div>
                        </Grid>

                        <Grid container item alignItems={'center'} justify="center">
                            <div className="ZoomLink">
                                {session.modality === 'virtual' && isTa && (
                                    <div className={(typeof session.useTALink === 'undefined' 
                                    || session.useTALink === false) ? "TaZoom" : "StudentZoom"}
                                    >
                                        {(typeof session.useTALink === 'undefined' || session.useTALink === false) ?
                                            <Grid container direction="row" justify="center" spacing={1}>
                                                <Grid container justify="center" item xs={2}>
                                                    <img src={zoom} alt="zoom" />
                                                </Grid>

                                                {zoomLinkDisplay === 'show' && (
                                                    <>
                                                        <Grid container item lg={7} md={10} xs={7}>
                                                            <input
                                                                type="text"
                                                                id="zoomLinkInput"
                                                                name="zoomLinkInput"
                                                                autoComplete="off"
                                                                value={zoomLink}
                                                                onChange={e => setZoomLink(e.target.value)}
                                                            />
                                                            <div className="CloseZoom">
                                                                <img
                                                                    onClick={closeZoomLink}
                                                                    src={closeZoom}
                                                                    alt="close zoom"
                                                                />
                                                            </div>
                                                        </Grid>
                                                        <Grid
                                                            container
                                                            justify="center"
                                                            alignItems={'center'}
                                                            item
                                                            lg={3}
                                                            md={12}
                                                            xs={3}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="SaveZoomLink"
                                                                onClick={saveZoomLink}
                                                            >
                                                            Save
                                                            </button>
                                                        </Grid>
                                                    </>
                                                )}

                                                {zoomLinkDisplay === 'hide' && (
                                                    <Grid container item xs={10}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setZoomLinkDisplay('show');
                                                            }}
                                                        >
                                                        update your virtual location
                                                        </button>
                                                    </Grid>
                                                )}

                                                {zoomLinkDisplay === 'saved' && (
                                                    <>
                                                        <Grid container justify="center" item xs={8}>
                                                            <p>{zoomLink}</p>
                                                        </Grid>
                                                        <Grid container item justify="center" xs={2}>
                                                            <img
                                                                id="EditZoom"
                                                                onClick={() => setZoomLinkDisplay('show')}
                                                                src={editZoomLink}
                                                                alt="edit zoom link"
                                                            />
                                                        </Grid>
                                                    </>
                                                )}
                                            </Grid>
                                            :
                                            <Grid
                                                container
                                                direction="row"
                                                justify="center"
                                                alignItems={'center'}
                                            >
                                                <Grid container justify="center" item xs={2}>
                                                    <img src={zoom} alt="zoom" />
                                                </Grid>
                                                <Grid container item xs={10}>
                                                    <p>{'Use TA zoom on course site'}</p>
                                                </Grid>
                                            </Grid>
                                        }
                                    </div>
                                )}

                                {session.modality === 'virtual' && !isTa && (
                                    <div className="StudentZoom">
                                        <Grid
                                            container
                                            direction="row"
                                            justify="center"
                                            alignItems={'center'}
                                        >
                                            <Grid container justify="center" item lg={2} md={2} xs={2}>
                                                <img src={zoom} alt="zoom" />
                                            </Grid>
                                            {
                                                (typeof session.useTALink === 'undefined' || 
                                                session.useTALink === false) &&
                                                    <Grid item lg={6} md={10} xs={6}>
                                                        <p>Zoom meeting link</p>
                                                    </Grid>
                                            }
                                            {(typeof session.useTALink === 'undefined' || session.useTALink === false) ?
                                                <Grid container justify="center" item lg={4} md={12} xs={4}>
                                                    {assignedQuestion?.answererLocation ? (
                                                        <a
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            href={assignedQuestion.answererLocation}
                                                        >
                                                            <button type="button" className="JoinButton">
                                                                Join
                                                            </button>
                                                        </a>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="JoinButton"
                                                            onClick={() => setShowError(true)}
                                                        >
                                                            Join
                                                        </button>
                                                    )}
                                                </Grid>
                                                :
                                                <Grid container item xs={10}>
                                                    <p>{'Use TA zoom on course site'}</p>
                                                </Grid>
                                            }
                                        </Grid>
                                    </div>
                                )}

                                {session.modality === 'review' && (
                                    <div className="StudentZoom">
                                        <Grid
                                            container
                                            direction="row"
                                            justify="center"
                                            alignItems={'center'}
                                        >
                                            <Grid container justify="center" item lg={2} md={2}>
                                                <img src={zoom} alt="zoom" />
                                            </Grid>
                                            <Grid item lg={6} md={10}>
                                                <p>Zoom meeting link</p>
                                            </Grid>

                                            <Grid
                                                container
                                                justify="center"
                                                item
                                                lg={4}
                                                md={12}
                                                alignItems={'center'}
                                            >
                                                <a
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href={session.link}
                                                >
                                                    <button type="button" className="JoinButton">
                                                        Join
                                                    </button>
                                                </a>
                                            </Grid>
                                        </Grid>
                                    </div>
                                )}

                                {session.modality === 'hybrid' && (
                                    <div className="StudentZoom">
                                        <Grid
                                            container
                                            direction="row"
                                            justify="center"
                                            alignItems={'center'}
                                        >
                                            <Grid container justify="center" item xs={2}>
                                                <img src={zoom} alt="zoom" />
                                            </Grid>
                                            <Grid container item xs={10}>
                                                <p>{(typeof session.useTALink === 'undefined' ||
                                                    session.useTALink === false) ? 'Use student provided Zoom link'
                                                    : 'Use TA zoom on course site'}</p>
                                            </Grid>
                                        </Grid>
                                    </div>
                                )}

                                {session.modality === 'in-person' && (
                                    <div className="StudentZoom">
                                        <Grid
                                            container
                                            direction="row"
                                            justify="center"
                                            alignItems={'center'}
                                        >
                                            <Grid container justify="center" item xs={2}>
                                                <img src={zoom} alt="zoom" />
                                            </Grid>
                                            <Grid container item xs={10}>
                                                <p>No Zoom link available</p>
                                            </Grid>
                                        </Grid>
                                    </div>
                                )}

                                {showError && (
                                    <JoinErrorMessage
                                        message={
                                            !myQuestion
                                                ? isOpen
                                                    ? 'Please fill out the "Join the Queue" form first'
                                                    : 'This queue has closed'
                                                : assignedQuestion && !assignedQuestion.answererLocation
                                                    ? 'Please wait for the TA to update their location'
                                                    : avgWaitTime === 'No information available'
                                                        ? 'Please wait for your turn to join the Zoom call'
                                                        : 'Please wait for your turn to ' +
                                                        'join the Zoom call (estimated wait time: ' +
                                                        avgWaitTime +
                                                        ')'
                                        }
                                        show={true}
                                        closeModal={() => {
                                            setShowError(false);
                                        }}
                                    />
                                )}
                            </div>
                        </Grid>
                    </Grid>
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
