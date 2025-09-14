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
import rightArrowIcon from "../../media/rightArrowIcon.svg";
import leftArrowIcon from "../../media/leftArrowIcon.svg";
import { useSessionQuestions, useSessionTAs } from "../../firehooks";
import { computeNumberAhead } from "../../utilities/questions";
import { RootState } from "../../redux/store";
import WaitTimeGraph from "./WaitTimeGraph";
import sampleData from "../../dummy_data.json";

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
        return " (" + totalHour + ":0" + totalMins + amPm + ") ";
    }
    return " (" + totalHour + ":" + totalMins + amPm + ") ";
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

    const tas = useSessionTAs(course, session);
    
    const pluralize = (count: number, singular: string, plural: string) => {
        return count <= 1 ? singular : plural;
    };

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
    }, [session.studentPerTaRatio, session.hasUnresolvedQuestion, tas, questions]);

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
    const visibleCount = 4;

    const visibleTAs = React.useMemo(() => {
        return tas.slice(startIndex, startIndex + visibleCount);
    }, [tas, startIndex, visibleCount]);
    const hasNext = startIndex + visibleCount < tas.length;

    return isDesktop ? (
        <header
            className="DesktopSessionInformationHeader"
            style={{
                height: "450px", // Fixed overall height for the entire component
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
                                    <Grid item xs={12} sm={4}>
                                        <div className="TAHeaderText">
                                            <p style={{ fontWeight: "bold", fontSize: "20px", margin: 0 }}>
                                                TA's ({tas.length})
                                            </p>
                                            <p style={{ fontSize: "14px", color: "#4d4d4d", margin: 0 }}>{ratioText}</p>
                                        </div>
                                    </Grid>

                                    {/* TA profile images on the right */}
                                    <Grid item xs={12} sm={8}>
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
                                                            <img
                                                                src={ta.photoUrl || "/placeholder.png"}
                                                                alt={`${ta.firstName} ${ta.lastName}'s Photo`}
                                                                className="TACircle"
                                                                referrerPolicy="no-referrer"
                                                            />
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
                            <p className="WaitSummary">
                                <span className="red">{numAhead} students</span> ahead |
                                <span className="blue"> {avgWaitTime}</span>
                                <span className="gray"> {esimatedTime}</span> estimated wait time
                            </p>
                        ) : (
                            <p className="WaitSummary">
                                <span className="red">{numAhead} students</span> ahead |
                                <span className="blue"> No information available</span>
                            </p>
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
