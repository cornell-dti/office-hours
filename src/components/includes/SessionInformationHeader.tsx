import * as React from "react";
import Moment from "react-moment";
import { Icon } from "semantic-ui-react";

import { Grid, Switch } from "@material-ui/core";
import { connect } from "react-redux";
import { useState } from "react";
import users from "../../media/users.svg";
import calendarIcon from "../../media/Calendar_icon.svg";
import clockIcon from "../../media/clock-regular_1.svg";
import hourglassIcon from "../../media/hourglass-half.svg";
import rightArrowIcon from "../../media/Right Arrow.svg";
import leftArrowIcon from "../../media/Left Arrow.svg";
import { useSessionQuestions, useSessionTAs } from "../../firehooks";
import { computeNumberAhead } from "../../utilities/questions";
import { RootState } from "../../redux/store";
import WaitTimeGraph from "./WaitTimeGraph";
import { buildWaitTimeDataFromMap, hasSessionsOnDate } from "../../firebasefunctions/waitTimeMap";

type Props = {
    session: FireSession;
    course: FireCourse;
    callback: () => void;
    user: FireUser;
    isDesktop: boolean;
    isTa: boolean;
    myQuestion: FireQuestion | null;
    questions: readonly FireQuestion[];
    selectedDateEpoch: number;
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
        return timeDispMins + " mins " + timeDispSecs + " s";
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
    myQuestion,
    questions,
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
    }, [session.studentPerTaRatio, session.hasUnresolvedQuestion, session.tas.length, questions]);

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


    // Compact typography for the wait-time summary lines
    const summaryTextStyle: React.CSSProperties = { fontSize: 14, lineHeight: '16px' };

    // WaitTime graph data (replaces dummy_data.json)
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
    }, [course?.courseId, selectedDateEpoch]);



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
                height: "310px", // More compact design
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

                                <p className="Title">
                                    {session.title || (
                                        <>
                                            Held by
                                            <span className="black">
                                                {" " + tas.map((ta) => 
                                                    ta.firstName + " " + ta.lastName
                                                ).join(", ")}
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
                                            format="dddd, MMM D"
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
                                            format="h:mm A" 
                                        />
                                        <Moment 
                                            date={session.endTime.seconds * 1000} 
                                            interval={0} 
                                            format=" - h:mm A" 
                                        />
                                    </div>
                                </div>

                                <div className="OneQueueInfo">
                                    {isTa && isOpen &&
                                        (<Grid
                                            container
                                            direction="row"
                                            justifyContent="center" 
                                            alignItems={'center'}
                                            spacing={4}
                                        >
                                            <Grid item xs={2} >
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
                                            <p style={{ 
                                                fontWeight: "bold", 
                                                fontSize: "20px", 
                                                margin: 0 
                                            }}
                                            >
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
                                    <p className="WaitSummary" style={summaryTextStyle}>
                                        <img src={users} alt="users" className="waitIcon" />
                                        <span className="red">{numAhead} students</span>
                                        <span>ahead</span>
                                    </p>
                                    <p className="WaitSummary" style={summaryTextStyle}>
                                        <img src={hourglassIcon} alt="hourglass" className="waitIcon hourglass" />
                                        <span className="blue"> {avgWaitTime}</span>
                                        <span className="gray"> {esimatedTime}</span>
                                        <span>estimated wait time</span>
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="WaitSummary" style={summaryTextStyle}>
                                        <img src={users} alt="users" className="waitIcon" />
                                        <span className="red">{numAhead} students</span>
                                        <span>ahead</span>
                                    </p>
                                    <p className="WaitSummary" style={{...summaryTextStyle, marginBottom: 5}}>
                                        <img src={hourglassIcon} alt="hourglass" className="waitIcon hourglass" />
                                        <span className="blue"> No information available</span>
                                    </p>
                                </>
                            );
                        })()}

                        <WaitTimeGraph
                            barData={graphData.barData}
                            timeKeys={graphData.timeKeys}
                            OHDetails={graphData.OHDetails}
                            selectedDateEpoch={selectedDateEpoch}
                            hasSessionsForSelectedDay={hasSessionsSelectedDay}
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


const mapStateToProps = (state: RootState) => ({
    user: state.auth.user,
});

export default connect(mapStateToProps, {})(SessionInformationHeader);
