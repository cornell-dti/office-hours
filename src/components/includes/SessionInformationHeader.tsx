/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import Moment from "react-moment";
import { Icon } from "semantic-ui-react";

import { Grid, Switch } from "@material-ui/core";
import { connect } from "react-redux";
import { useState } from "react";
import { pauseSession } from "../../firebasefunctions/session";
import users from "../../media/users.svg";
import calendarIcon from "../../media/Calendar_icon.svg";
import clockIcon from "../../media/clock-regular_1.svg";
import hourglassIcon from "../../media/hourglass-half.svg";
import rightArrowIcon from "../../media/RightArrow.svg";
import leftArrowIcon from "../../media/LeftArrow.svg";
import zoom from "../../media/zoom.svg";
import closeZoom from "../../media/closeZoom.svg";
import editZoomLink from "../../media/editZoomLink.svg";
import { useSessionQuestions, useSessionTAs } from "../../firehooks";
import { computeNumberAhead } from "../../utilities/questions";
import { RootState } from "../../redux/store";
import WaitTimeGraph from "./WaitTimeGraph";
import { buildWaitTimeDataFromMap, hasSessionsOnDate } from "../../firebasefunctions/waitTimeMap";
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
    selectedDateEpoch: number;
};

const pluralize = (count: number, singular: string, plural: string) => {
    return count <= 1 ? singular : plural;
};

const formatAvgTime = (rawTimeSecs: number) => {
    if (!Number.isFinite(rawTimeSecs)) {
        return "No information available";
    }
    const timeSecs = Math.floor(rawTimeSecs);
    const timeMins = Math.floor(timeSecs / 60);
    const timeHours = Math.floor(timeMins / 60);
    const timeDispSecs = timeSecs - timeMins * 60;
    const timeDispMins = timeMins - timeHours * 60;
    if (!Number.isFinite(timeSecs) || isNaN(timeSecs)) {
        return "No information available";
    }
    if (timeMins === 0) {
        return timeDispSecs + " s";
    }
    if (timeHours === 0) {
        return pluralize(timeDispMins, timeDispMins + " min " + timeDispSecs + " s",
            timeDispMins + " mins " + timeDispSecs + " s")
    }
    return timeHours + " h " + timeDispMins + " mins";
};
const formatEstimatedTime = (waitTimeSecs: number, currentTime: Date) => {
    if (!Number.isFinite(waitTimeSecs)) {
        return " (No estimate available) ";
    }
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

    if (!Number.isFinite(timeSecs) || currHour + timeHours >= 24) {
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
    selectedDateEpoch,
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
    }, [session.studentPerTaRatio, session.tas.length, session.hasUnresolvedQuestion, questions]);

    const tas = useSessionTAs(course, session);
    const numAhead = computeNumberAhead(
        useSessionQuestions(session.sessionId, user.roles[course.courseId] !== undefined),
        user.userId,
    );

    let dynamicPosition = questions.findIndex((question) => question.askerId === myQuestion?.askerId) + 1;

    if (dynamicPosition === 0) {
        dynamicPosition = questions.length === 0 ? 1 : questions.length + 1
        dynamicPosition = questions.length + 1;
    }

    const avgWaitTime =
        formatAvgTime((session.totalWaitTime / session.assignedQuestions)
            * (isTa ? 1 : dynamicPosition - 1));

    const today = new Date();
    const esimatedTime = formatEstimatedTime(
        (session.totalWaitTime / session.assignedQuestions) * (isTa ? 1 : dynamicPosition-1),
        today,
    );

    // ------Virtual info----------
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

    // ------Wait Time info---------
    // WaitTime graph data
    const [graphData, setGraphData] = React.useState({
        barData: [] as any[],
        timeKeys: [] as string[],
        yMax: 10,
        legend: "Avg minutes per student",
        OHDetails: {} as any,
    });

    React.useEffect(() => {
        let ignore = false;
        async function load() {
            if (!course?.courseId) return;
            const data = await buildWaitTimeDataFromMap(course.courseId);
            if (!ignore) setGraphData(data);
        }
        load();
        return () => {
            ignore = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [course?.courseId, selectedDateEpoch]);

    // Determine if the selected date has any session (exact day match)
    const [hasSessionsSelectedDay, setHasSessionsSelectedDay] = React.useState<boolean | undefined>(undefined);
    React.useEffect(() => {
        let ignore = false;
        async function run() {
            if (!course?.courseId) {
                setHasSessionsSelectedDay(undefined);
                return;
            }
            const date = new Date(selectedDateEpoch);
            const exists = await hasSessionsOnDate(course.courseId, date);
            if (!ignore) setHasSessionsSelectedDay(exists);
        }
        run();
        return () => {
            ignore = true;
        };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    [course?.courseId, selectedDateEpoch]);

    // ----TA info------

    const [startIndex, setStartIndex] = useState(0);
    const [hoveredTA, setHoveredTA] = useState<number | null>(null);
    const visibleCount = 4;

    const visibleTAs = React.useMemo(() => {
        return tas.slice(startIndex, startIndex + visibleCount);
    }, [tas, startIndex, visibleCount]);
    const hasNext = startIndex + visibleCount < tas.length;

    return (
        <div>
            <header className={isDesktop ? (`DesktopSessionInformationHeader`): (`SessionInformationHeader`)}> 
                {!isDesktop && (
                    <div className="header">
                        <p className="BackButton" onClick={() => callback()}>
                            <i className="left" />
                            {course.code}
                        </p>
                    </div>
                )}
                <Grid container style={{ alignItems: "stretch", height: "100%" }}>
                    <Grid item xs={12} sm={12} md={12} lg={6} style={{ display: "flex" }}>
                        <Grid container direction="column" spacing={2} style={{ width: "100%" }}>
                            <Grid
                                item
                                style={{
                                    display: "flex",
                                    height: "65%",
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
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
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
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <img 
                                                src={clockIcon} 
                                                alt="Clock Icon for Office Hour Date" 
                                                className="clockIcon" 
                                            />
                                            <Moment 
                                                date={session.startTime.seconds * 1000} 
                                                interval={0} 
                                                format={"h:mm A"} 
                                            />
                                            <Moment 
                                                date={session.endTime.seconds * 1000} 
                                                interval={0} 
                                                format={" - h:mm A"} 
                                            />
                                        </div>
                                    </div>

                                    <div className="OneQueueInfo">
                                        {isTa && isOpen &&
                                        (<Grid
                                            container
                                            direction="row"
                                            justifyContent="flex-start" 
                                            alignItems={'center'}
                                            spacing={4}
                                        >
                                            <Grid item xs={2} className="switchIcon">
                                                <Switch 
                                                    className="closeQueueSwitch" 
                                                    checked={!isPaused} 
                                                    onChange={handlePause} 
                                                    color="primary" 
                                                />
                                            </Grid>
                                            <Grid item xs={10} className="QueueText">
                                                <p>{`Queue is ${isPaused ? "closed" : "open"}`} </p>
                                            </Grid>
                                        </Grid>)}
                                    </div>

                                    <div className="ZoomLink">
                                        {session.modality === 'virtual' && isTa && (
                                            <div className={(typeof session.useTALink === 'undefined'
                                            || session.useTALink === false) ? "TaZoom" : "StudentZoom"}
                                            >
                                                {(typeof session.useTALink === 'undefined' || 
                                                    session.useTALink === false) ?
                                                    <Grid 
                                                        container 
                                                        direction="row" 
                                                        justifyContent="flex-start" 
                                                        spacing={1}
                                                    >
                                                        <Grid 
                                                            container 
                                                            justifyContent="flex-start" 
                                                            item 
                                                            xs={2} 
                                                            className="zoomIcon"
                                                        >
                                                            <img src={zoom} alt="zoom" />
                                                        </Grid>

                                                        {zoomLinkDisplay === 'show' && (
                                                            <>
                                                                <Grid 
                                                                    container 
                                                                    item 
                                                                    lg={7} 
                                                                    md={10} 
                                                                    xs={7} 
                                                                    className="zoomInput"
                                                                >
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
                                                                    justifyContent="flex-start"
                                                                    alignItems={'center'}
                                                                    item
                                                                    lg={3}
                                                                    md={12}
                                                                    xs={3}
                                                                    className="saveButton"
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
                                                                <Grid container item xs={8} className="savedZoomText">
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
                                                                className="zoomIcon"
                                                            >
                                                                <img src={zoom} alt="zoom" />
                                                            </Grid>
                                                            <Grid item lg={6} md={10} xs={6} className="ZoomLinkText">
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
                                                    alignItems={'center'}
                                                >
                                                    <Grid 
                                                        container 
                                                        justifyContent="flex-start" 
                                                        item 
                                                        lg={2} 
                                                        md={2} 
                                                        xs={2}
                                                        className="zoomIcon"
                                                    >
                                                        <img src={zoom} alt="zoom" />
                                                    </Grid>
                                                    <Grid item lg={6} md={10} xs={6} className="ZoomLinkText">
                                                        <p>Zoom link</p>
                                                    </Grid>
                                                    <Grid container item lg={4} md={12} xs={4} className="zoomButton">
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
                                                    <Grid 
                                                        container 
                                                        justifyContent="flex-start" 
                                                        item 
                                                        lg={2} 
                                                        md={2}
                                                        className="zoomIcon"
                                                    >
                                                        <img src={zoom} alt="zoom" />
                                                    </Grid>
                                                    <Grid item lg={6} md={10} className="ZoomLinkText">
                                                        <p>Zoom Link</p>
                                                    </Grid>

                                                    <Grid
                                                        container
                                                        justifyContent="center"
                                                        item
                                                        lg={4}
                                                        md={12}
                                                        alignItems={'center'}
                                                        className="zoomButton"
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
                                                            <Grid item lg={6} md={10} xs={6} className="ZoomLinkText">
                                                                <p>Zoom Link</p>
                                                            </Grid>
                                                            <Grid 
                                                                container 
                                                                justifyContent="center" 
                                                                item 
                                                                lg={4} 
                                                                md={12} 
                                                                xs={4}
                                                                className="zoomButton"
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
                            <Grid item style={{ width: "100%", display: "flex", height: "35%" }}>
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
                                                <p style={{ 
                                                    fontSize: "14px", 
                                                    color: "#4d4d4d", 
                                                    margin: 0, 
                                                    whiteSpace: "nowrap" 
                                                }}
                                                >
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
                                                        <img 
                                                            src={leftArrowIcon} 
                                                            alt="scroll left" 
                                                            className="arrowIcon" 
                                                        />
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
                                                                        alt={`${ta.firstName} ${ta.lastName}`}
                                                                        className="TACircle"
                                                                        style={{
                                                                            width: "48px",
                                                                            height: "48px",
                                                                            border: "2px solid #f2f2f2",
                                                                            borderRadius: "50%",
                                                                            objectFit: "cover",
                                                                            cursor: "pointer"
                                                                        }}
                                                                        referrerPolicy="no-referrer"
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
                    <Grid item xs={12} sm={12} md={12} lg={6} style={{ display: "flex", minWidth: 0 }}>
                        <div className="QueueInfo">
                            {(() => {
                                const isTodayForHeader = new Date(selectedDateEpoch).toDateString() === 
                                new Date().toDateString();
                                return (
                                    <p 
                                        className="WaitTitle" 
                                        style={isTodayForHeader ? { marginBottom: 2 } : undefined}
                                    >
                                    Wait Time
                                    </p>
                                );
                            })()}
                            {(() => {
                                const selectedDate = new Date(selectedDateEpoch);
                                const today = new Date();
                                const isToday = selectedDate.toDateString() === today.toDateString();
                                const isFutureDate = selectedDate > today;
                                const dayNames = [
                                    "Sunday", "Monday", "Tuesday", "Wednesday", 
                                    "Thursday", "Friday", "Saturday"
                                ];
                                const selectedDay = dayNames[selectedDate.getDay()];
                            
                                // Subtitle rules:
                                // - Today with no sessions: show "Wait times for Today"
                                // - Today with sessions: no subtitle (we show the live block below)
                                // - Not today: keep existing future/past subtitles
                                if (isToday) {
                                    if (hasSessionsSelectedDay === false) {
                                        return (
                                            <p className="WaitSubtitle">
                                            Wait times for Today
                                            </p>
                                        );
                                    }
                                    return null;
                                }

                                return (
                                    <p className="WaitSubtitle">
                                        {isFutureDate ? (
                                            <>This is an estimate of wait times on <strong>{selectedDay}</strong> for {
                                                course.code
                                            }.</>
                                        ) : (
                                            `Wait times for ${selectedDay}`
                                        )}
                                    </p>
                                );
                            })()}
                            {(() => {
                                const selectedDate = new Date(selectedDateEpoch);
                                const today = new Date();
                                const isToday = selectedDate.toDateString() === today.toDateString();
                            
                                // Only show queue info for today AND if today has scheduled office hours
                                if (!isToday || hasSessionsSelectedDay === false) return null;
                        
                                return avgWaitTime !== "No information available" ? (
                                    <>
                                        <p className="WaitSummary">
                                            <img src={users} alt="users" className="waitIcon" />
                                            <span className="red"> {numAhead === 1 ? numAhead + ' student' :
                                                numAhead + ' students'} </span>
                                            <span>ahead</span>
                                        </p>
                                        <p className="WaitSummary">
                                            <img src={hourglassIcon} alt="hourglass" className="waitIcon hourglass" />
                                            <span className="blue"> {avgWaitTime}</span>
                                            <span className="gray"> {esimatedTime}</span>
                                            <span> {isTa ? 'to move one position' : 'estimated wait time'} </span>
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
                                )
                            })()}
                            <WaitTimeGraph
                                barData={graphData.barData}
                                timeKeys={graphData.timeKeys}
                                OHDetails={graphData.OHDetails}
                                selectedDateEpoch={selectedDateEpoch}
                                hasSessionsForSelectedDay={hasSessionsSelectedDay}
                                courseId={course?.courseId}
                                sessionStartTime={session.startTime}
                                sessionEndTime={session.endTime}
                            />
                        </div>
                    </Grid>
                </Grid>
            </header>
        </div>
    );
};


const mapStateToProps = (state: RootState) => ({
    user: state.auth.user,
});

export default connect(mapStateToProps, {})(SessionInformationHeader);