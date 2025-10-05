/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import Moment from "react-moment";
import { Icon } from "semantic-ui-react";

import { Grid } from "@material-ui/core";
import { connect } from "react-redux";
import { useState } from "react";
import { pauseSession } from "../../firebasefunctions/session";
import users from "../../media/users.svg";
import calendarIcon from "../../media/Calendar_icon.svg";
import clockIcon from "../../media/clock-regular_1.svg";
import hourglassIcon from "../../media/hourglass-half.svg";
import rightArrowIcon from "../../media/Right Arrow.svg";
import leftArrowIcon from "../../media/Left Arrow.svg";
import zoom from "../../media/zoom.svg";
import closeZoom from "../../media/closeZoom.svg";
import editZoomLink from "../../media/editZoomLink.svg";
import { useSessionQuestions, useSessionTAs } from "../../firehooks";
import { computeNumberAhead } from "../../utilities/questions";
import { RootState } from "../../redux/store";
import WaitTimeGraph from "./WaitTimeGraph";
import sampleData from "../../dummy_data.json";
import JoinErrorMessage from "./JoinErrorMessage";

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
        return "No information available";
    }
    if (timeMins === 0) {
        return timeDispSecs + " s";
    }
    if (timeHours === 0) {
        return timeDispMins + " mins " + timeDispSecs + " s";
    }
    return timeHours + " h " + timeDispMins + " mins";
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
        amPm = " pm";
    }
    let totalHour = (currHour + timeHours) % 12;
    const totalMins = (currMins + timeDispMins) % 60;

    if (currHour + timeHours >= 24) {
        return " (No estimate available) ";
    }
    if (currMins + timeDispMins >= 60) {
        totalHour = (totalHour + 1) % 12;
    }
    if (totalMins < 10) {
        return <> (<> <strong>{totalHour}:0{totalMins}{amPm}</strong> </>) </>;
    }
    return <> (<> <strong>{totalHour}:{totalMins}{amPm}</strong> </>) </>;
};
const pluralize = (count: number, singular: string, plural: string) => {
    return count <= 1 ? singular : plural;
};

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
    const [ratioText, setRatioText] = React.useState("");

    React.useEffect(() => {
        const ratio = session.studentPerTaRatio;
        const numberOfTAs = session.tas.length;
        if (ratio === undefined) {
            if (numberOfTAs === 0) {
                setRatioText("No TAs available");
            } else {
                setRatioText(`${numberOfTAs} ${pluralize(numberOfTAs, "TA", "TAs")} available`);
            }
            
        } else if (ratio === -1) {
            setRatioText("No TAs available");
            
        } else if (session.hasUnresolvedQuestion) {
            setRatioText(`${ratio} ${pluralize(ratio, "student", "students")}/TA`);
        } else {
            setRatioText(`${numberOfTAs} ${pluralize(numberOfTAs, "TA", "TAs")} available`);
        }
    }, [session.studentPerTaRatio, session.hasUnresolvedQuestion, questions]);

    const tas = useSessionTAs(course, session);
    const numAhead = computeNumberAhead(
        useSessionQuestions(session.sessionId, user.roles[course.courseId] !== undefined),
        user.userId,
    );

    let dynamicPosition = questions.findIndex((question) => question.askerId === myQuestion?.askerId) + 1;

    if (dynamicPosition === 0) {
        dynamicPosition = questions.length + 1;
    }

    const avgWaitTime = formatAvgTime(
        (session.totalWaitTime / session.assignedQuestions) * (isTa ? 1 : dynamicPosition),
    );

    const today = new Date();
    const esimatedTime = formatEstimatedTime(
        (session.totalWaitTime / session.assignedQuestions) * (isTa ? 1 : dynamicPosition),
        today,
    );

    const [zoomLinkDisplay, setZoomLinkDisplay] = React.useState("hide");
    const [zoomLink, setZoomLink] = React.useState("");
    const [showError, setShowError] = React.useState(false);
    const [showErrorMessage, setShowErrorMessage] = React.useState("");

    React.useEffect(() => {
        if (typeof virtualLocation === "string" && virtualLocation.trim() !== "") {
            setZoomLink(virtualLocation);
            setZoomLinkDisplay("saved");
        }
    }, [virtualLocation]);

    const closeZoomLink = () => {
        if (typeof virtualLocation === "string" && virtualLocation.trim() !== "") {
            setZoomLink(virtualLocation);
            setZoomLinkDisplay("saved");
        } else {
            setZoomLink("");
            setZoomLinkDisplay("hide");
        }
    };

    const saveZoomLink = () => {
        onUpdate(zoomLink);
        if (zoomLink === "") {
            setZoomLinkDisplay("hide");
        } else {
            setZoomLinkDisplay("saved");
        }
    };

    const handlePause = () => {
        pauseSession(session, !session.isPaused);
    };

    const activateError = () => {
        setShowError(true);
        let message = "";
        if (!myQuestion) {
            if (isOpen) {
                message = 'Please fill out the "Join the Queue" form first';
            } else {
                message = "This queue has closed";
            }
        } else if (
            (session.modality === "virtual" || session.modality === "hybrid") &&
            !(typeof session.useTALink === "undefined" || session.useTALink === false) &&
            !session.TALink
        ) {
            message = "A professor has not set a link for this office hour. Please reference the course website.";
        } else if (assignedQuestion && !assignedQuestion.answererLocation) {
            message = "Please wait for the TA to update their location";
        } else if (avgWaitTime === "No information available") {
            message = "Please wait for your turn to join the Zoom call";
        } else {
            message = `Please wait for your turn to join the Zoom call (estimated wait time: ${avgWaitTime})`;
        }
        setShowErrorMessage(message);
    };

    const [startIndex, setStartIndex] = useState(0);
    const [hoveredTA, setHoveredTA] = useState<number | null>(null);
    const visibleCount = 4;

    const visibleTAs = React.useMemo(() => {
        return tas.slice(startIndex, startIndex + visibleCount);
    }, [tas, startIndex, visibleCount]);
    const hasNext = startIndex + visibleCount < tas.length;

    return isDesktop ? (
        <header
            className="DesktopSessionInformationHeader"
            style={{
                height: "280px", // More compact design
            }}
        >
            <Grid container style={{ alignItems: "stretch", height: "100%" }}>
                {/* Left Column (Boxes 1 & 2) */}
                <Grid item style={{ display: "flex", width: "40%" }}>
                    <Grid container direction="column" spacing={2} style={{ width: "100%" }}>
                        <Grid
                            item
                            style={{
                                display: "flex",
                                height: "60%",
                            }}
                        >
                            <div className="LeftInformationHeader" style={{ width: "100%" }}>
                                {"building" in session ? (
                                    <p className="Location">
                                        {[session.building, session.room].map((s) => s || "").join(" ")}
                                    </p>
                                ) : session.modality === "virtual" ? (
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
                                                {" " + tas.map((ta) => ta.firstName + " " + ta.lastName).join(", ")}
                                            </span>
                                        </>
                                    )}
                                    <br />
                                </p>

                                <div className="Date">
                                    <img
                                        src={calendarIcon}
                                        alt="Calendar Icon for Office Hour Date"
                                        className="calendarIcon"
                                    />
                                    <Moment
                                        date={session.startTime.seconds * 1000}
                                        interval={0}
                                        format={"dddd, MMM D"}
                                    />
                                    <br />
                                    <img src={clockIcon} alt="Clock Icon for Office Hour Date" className="clockIcon" />
                                    <Moment date={session.startTime.seconds * 1000} interval={0} format={"h:mm A"} />
                                    <Moment date={session.endTime.seconds * 1000} interval={0} format={" - h:mm A"} />
                                </div>

                                <div className="ZoomLink">
                                    {session.modality === 'virtual' && isTa && (
                                        <div className={(typeof session.useTALink === 'undefined'
                                        || session.useTALink === false) ? "TaZoom" : "StudentZoom"}
                                        >
                                            {(typeof session.useTALink === 'undefined' || session.useTALink === false) ?
                                                <Grid container direction="row" justifyContent="center" spacing={1}>
                                                    <Grid container justifyContent="flex-start" item xs={2}>
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
                                                                justifyContent="center"
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
                                                            <Grid container justifyContent="center" item xs={8}>
                                                                <p>{zoomLink}</p>
                                                            </Grid>
                                                            <Grid container item justifyContent="center" xs={2}>
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
                                                <div className="StudentZoom">
                                                    <Grid
                                                        container
                                                        direction="row"
                                                        justifyContent="flex-start"
                                                        alignItems={'center'}
                                                    >
                                                        <Grid 
                                                            container 
                                                            justifyContent="flex-start" 
                                                            item 
                                                            lg={2} 
                                                            md={2} 
                                                            xs={2}
                                                        >
                                                            <img src={zoom} alt="zoom" />
                                                        </Grid>
                                                        <Grid item lg={6} md={10} xs={6}>
                                                            <p>Zoom Link</p>
                                                        </Grid>
                                                        <a
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            href={session.TALink}
                                                        >
                                                            <button type="button" className="JoinButton">
                                                                Join
                                                            </button>
                                                        </a>
                                                    </Grid>
                                                </div>
                                            }
                                        </div>
                                    )}

                                    {session.modality === 'virtual' && !isTa && (
                                        <div className="StudentZoom">
                                            <Grid
                                                container
                                                direction="row"
                                                justifyContent="center"
                                                alignItems={'center'}
                                            >
                                                <Grid container justifyContent="flex-start" item lg={2} md={2} xs={2}>
                                                    <img src={zoom} alt="zoom" />
                                                </Grid>
                                                <Grid item lg={6} md={10} xs={6}>
                                                    <p>Zoom link</p>
                                                </Grid>
                                                <Grid container justifyContent="center" item lg={4} md={12} xs={4}>
                                                    {(!(typeof session.useTALink === 'undefined' || 
                                                                session.useTALink === false) && session.TALink) || 
                                                                assignedQuestion?.answererLocation ? (
                                                            <a
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                href={(typeof session.useTALink === 'undefined' || 
                                                                session.useTALink === false) ? 
                                                                assignedQuestion?.answererLocation : 
                                                                    session.TALink}
                                                            >
                                                                <button type="button" className="JoinButton">
                                                                Join
                                                                </button>
                                                            </a>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="JoinButton"
                                                                onClick={() => activateError()}
                                                            >
                                                            Join
                                                            </button>
                                                        )}
                                                </Grid>
                                            </Grid>
                                        </div>
                                    )}

                                    {session.modality === 'review' && (
                                        <div className="StudentZoom">
                                            <Grid
                                                container
                                                direction="row"
                                                justifyContent="center"
                                                alignItems={'center'}
                                            >
                                                <Grid container justifyContent="flex-start" item lg={2} md={2}>
                                                    <img src={zoom} alt="zoom" />
                                                </Grid>
                                                <Grid item lg={6} md={10}>
                                                    <p>Zoom Link</p>
                                                </Grid>

                                                <Grid
                                                    container
                                                    justifyContent="center"
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
                                                justifyContent="center"
                                                alignItems={'center'}
                                            >
                                                <Grid container justifyContent="flex-start" item xs={2}>
                                                    <img src={zoom} alt="zoom" />
                                                </Grid>
                                                {(typeof session.useTALink === 'undefined' ||
                                                    session.useTALink === false) ? (<Grid container item xs={10}>
                                                        <p>Use student provided Zoom link</p>
                                                    </Grid>): (<>
                                                        <Grid item lg={6} md={10} xs={6}>
                                                            <p>Zoom Link</p>
                                                        </Grid>
                                                        <Grid 
                                                            container 
                                                            justifyContent="center" 
                                                            item 
                                                            lg={4} 
                                                            md={12} 
                                                            xs={4}
                                                        >
                                                            <a
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                href={
                                                                    session.TALink}
                                                            >
                                                                <button type="button" className="JoinButton">
                                                                            Join
                                                                </button>
                                                            </a>
                                                        </Grid>
                                                    </>)}
                                            </Grid>
                                        </div>
                                    )}

                                    

                                    {session.modality === 'in-person' && (
                                        <div className="StudentZoom">
                                            <Grid
                                                container
                                                direction="row"
                                                justifyContent="center"
                                                alignItems={'center'}
                                            >
                                                <Grid container justifyContent="flex-start" item xs={2}>
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
                                            message={showErrorMessage}
                                            show={true}
                                            closeModal={() => {
                                                setShowError(false);
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </Grid>
                        <Grid item style={{ width: "100%", display: "flex", height: "40%" }}>
                            <div className="TAsHeader">
                                <Grid
                                    container
                                    alignItems="center"
                                    justifyContent="space-between"
                                    style={{ height: "100%", width: "100%" }}
                                >
                                    {/* Text on the left */}
                                    <Grid item xs={12} sm={3}>
                                        <div className="TAHeaderText">
                                            <p style={{ fontWeight: "bold", fontSize: "20px", margin: 0 }}>
                                                TA's ({tas.length})
                                            </p>
                                            <p style={{ fontSize: "14px", color: "#4d4d4d", margin: 0, whiteSpace: "nowrap" }}>
                                                {ratioText}
                                            </p>
                                        </div>
                                    </Grid>

                                    {/* TA profile images on the right */}
                                    <Grid item xs={12} sm={9}>
                                        <div className="TAImagesWrapper">
                                            {startIndex > 0 && (
                                                <div
                                                    className="ScrollArrow"
                                                    onClick={() => setStartIndex((prev) => prev - 1)}
                                                >
                                                    <img src={leftArrowIcon} alt="scroll left" className="arrowIcon" />
                                                </div>
                                            )}

                                            <div className="TAImagesScrollWrapper">
                                                <div className="TAImagesScroll">
                                                    {visibleTAs.map((ta, index) => (
                                                        <div key={index} className="TACircleContainer">
                                                            <div 
                                                                className="TATooltipWrapper"
                                                                style={{
                                                                    position: "relative",
                                                                    display: "inline-block"
                                                                }}
                                                                onMouseEnter={() => {
                                                                    setHoveredTA(index);
                                                                }}
                                                                onMouseLeave={() => {
                                                                    setHoveredTA(null);
                                                                }}
                                                            >
                                                                <img
                                                                    src={ta.photoUrl || "/placeholder.png"}
                                                                    alt={`${ta.firstName} ${ta.lastName}'s Photo`}
                                                                    className="TACircle"
                                                                    style={{
                                                                        width: "48px",
                                                                        height: "48px",
                                                                        border: "2px solid #f2f2f2",
                                                                        borderRadius: "50%",
                                                                        objectFit: "cover",
                                                                        cursor: "pointer"
                                                                    }}
                                                                />
                                                                {hoveredTA === index && (
                                                                    <div 
                                                                        className="TATooltip"
                                                                        style={{
                                                                            position: "absolute",
                                                                            bottom: "calc(100% + 8px)",
                                                                            left: "50%",
                                                                            transform: "translateX(-50%)",
                                                                            background: "white",
                                                                            padding: "8px 12px",
                                                                            borderRadius: "8px",
                                                                            fontSize: "13px",
                                                                            color: "#333",
                                                                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                            whiteSpace: "nowrap",
                                                                            zIndex: 9999,
                                                                            border: "1px solid #e5e7eb"
                                                                        }}
                                                                    >
                                                                        {ta.firstName} {ta.lastName}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {hasNext && (
                                                <div
                                                    className="ScrollArrow"
                                                    onClick={() => setStartIndex((prev) => prev + 1)}
                                                >
                                                    <img
                                                        src={rightArrowIcon}
                                                        alt="scroll right"
                                                        className="arrowIcon"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item style={{ display: "flex", width: "60%" }}>
                    <div className="QueueInfo">
                        <p className="WaitTitle">Wait Time</p>
                        {avgWaitTime !== "No information available" ? (
                            <>
                                <p className="WaitSummary">
                                    <img src={users} alt="users" className="waitIcon" />
                                    <span className="red">{numAhead} students</span>
                                    <span>ahead</span>
                                </p>
                                <p className="WaitSummary">
                                    <img src={hourglassIcon} alt="hourglass" className="waitIcon hourglass" />
                                    <span className="blue"> {avgWaitTime}</span>
                                    <span className="gray"> {esimatedTime}</span>
                                    <span>estimated wait time</span>
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="WaitSummary">
                                    <img src={users} alt="users" className="waitIcon" />
                                    <span className="red">{numAhead} students</span>
                                    <span>ahead</span>
                                </p>
                                <p className="WaitSummary">
                                    <img src={hourglassIcon} alt="hourglass" className="waitIcon hourglass" />
                                    <span className="blue"> No information available</span>
                                </p>
                            </>
                        )}
                        <WaitTimeGraph
                            barData={sampleData.barData}
                            yMax={sampleData.yMax}
                            timeKeys={sampleData.timeKeys}
                            legend={sampleData.legend}
                            OHDetails={sampleData.OHDetails}
                        />
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
                        {"building" in session ? (
                            <span>
                                <p className="Location">{`${session.building} ${session.room}`}</p>
                            </span>
                        ) : (
                            <span>Online</span>
                        )}
                        <Moment date={session.startTime.toDate()} interval={0} format={"h:mm A"} />
                        <Moment date={session.endTime.toDate()} interval={0} format={" - h:mm A"} />
                    </div>
                    <div className="Picture">
                        <img
                            src={tas[0] ? tas[0].photoUrl : "/placeholder.png"}
                            alt={
                                tas[0] ? `${tas[0].firstName} ${tas[0].lastName}'s Photo URL` : "Placeholder photo url"
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
                        <span className="red">{numAhead + "students "}</span>
                        in queue
                    </p>
                </div>
                <div className="OfficeHourInfo">
                    <div className="OfficeHourDate">
                        <p>
                            <Icon name="calendar" />
                            <Moment date={session.startTime.toDate()} interval={0} format={"dddd, D MMM"} />
                        </p>
                    </div>
                    <p>
                        {session.title || (
                            <>
                                Held by
                                <span className="black">
                                    {" " + tas.map((ta) => ta.firstName + " " + ta.lastName).join(" and ")}
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
    user: state.auth.user,
});

export default connect(mapStateToProps, {})(SessionInformationHeader);
