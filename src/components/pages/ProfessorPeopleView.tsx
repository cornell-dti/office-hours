import React, { useState } from "react";
import { RouteComponentProps } from "react-router";
import moment from "moment";
import { DateRangePicker } from "react-dates";
import { BarDatum } from "@nivo/bar";
// import QuestionsBarChart from "../includes/QuestionsBarChart";
import QuestionsBarGraph from "../includes/QuestionsBarGraph";
import ProfessorSidebar from "../includes/ProfessorSidebar";
import QuestionsPieChart from "../includes/QuestionsPieChart";
import QuestionsLineChart from "../includes/QuestionsLineChart";
// import QuestionsBarChart from "../includes/QuestionsBarChart";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import { useCourse, useCourseUsersMap, useCoursesBetweenDates } from "../../firehooks";
import TopBar from "../includes/TopBar";

const ProfessorPeopleView = (props: RouteComponentProps<{ courseId: string }>) => {
    const courseId = props.match.params.courseId;

    const [startDate, setStartDate] = useState(moment(new Date()).add(-1, "months"));
    const [endDate, setEndDate] = useState(moment(new Date()));
    const [focusedInput, setFocusedInput] = useState<"endDate" | "startDate" | null>(null);

    const course = useCourse(courseId);
    const courseUsers = useCourseUsersMap(courseId, true);
    // Fetch sessions for course between dates
    const { sessions, questions } = useCoursesBetweenDates(startDate, endDate, courseId);

    // Compute necessary data
    // Aggregate Stats
    const allQuestions = questions.flat();
    const totalQuestions = sessions.reduce((accumulator, session) => {
        return accumulator + session.totalQuestions;
    }, 0);
    const unresolvedQuestions = allQuestions.filter((q) => q.status === "unresolved");
    const percentUnresolved = totalQuestions ? Math.round((100 * unresolvedQuestions.length) / totalQuestions) : 100;
    const percentResolved = 100 - percentUnresolved;

    // Busiest Session Data
    const busiestSessionIndex = questions.reduce(
        (busiestIndex, currentQs, i, arr) => (currentQs.length > arr[busiestIndex].length ? i : busiestIndex),
        0
    );

    const busiestSession: FireSession | undefined = sessions[busiestSessionIndex];
    const busiestSessionInfo = busiestSession && {
        ...("building" in busiestSession
            ? {
                building: busiestSession.building,
                room: busiestSession.room,
                online: false as const,
            }
            : { online: true as const }),
        ohDate: moment(busiestSession.startTime.seconds * 1000).format("MMMM Do"),
        startHour: moment(busiestSession.startTime.seconds * 1000).format("h:mm a"),
        endHour: moment(busiestSession.endTime.seconds * 1000).format("h:mm a"),
        dayOfWeek: moment(busiestSession.startTime.seconds * 1000).format("dddd"),
        date: moment(busiestSession.startTime.seconds * 1000).format("MMMM Do YYYY"),
        taNames: busiestSession.tas
            .map((userId) => {
                const courseUser = courseUsers[userId];
                if (courseUser === undefined) {
                    return "unknown";
                }
                return `${courseUser.firstName} ${courseUser.lastName}`;
            })
            .join(", "),
        totalQuestions: busiestSession.totalQuestions,
        resolvedQuestions: busiestSession.resolvedQuestions,
    };

    const calcTickVals = (yMax: number) => {
        if (yMax === 0) {
            return [0];
        }
        const end = yMax + (6 - (yMax % 6));
        let start = 0;
        const step = end / 6;
        const tickVals = [];
        while (end + step >= start) {
            tickVals.push(start);
            start += step;
        }
        return tickVals;
    };

    const calculateAverageWaitTime = (session: FireSession) => {
        return session.assignedQuestions === 0 ? 0 : session.totalWaitTime / session.assignedQuestions / 60;
    };

    const averageWaitTimeLineChartQuestionsTest: { x: string; y: number }[] = [];
    let averageWaitTimeMax = 0;
    for (const session of sessions) {
        const x = moment(session.startTime.seconds * 1000).format("MMM D");
        const y = calculateAverageWaitTime(session);
        const lastIndex = averageWaitTimeLineChartQuestionsTest.length - 1;
        if (averageWaitTimeLineChartQuestionsTest[lastIndex]?.x === x) {
            averageWaitTimeLineChartQuestionsTest[lastIndex].y += y;
            averageWaitTimeMax = Math.max(averageWaitTimeMax, averageWaitTimeLineChartQuestionsTest[lastIndex].y);
        } else {
            averageWaitTimeLineChartQuestionsTest.push({ x, y });
            averageWaitTimeMax = Math.max(averageWaitTimeMax, y);
        }
    }

    const totalWaitTime = sessions.reduce((accumulator, session) => {
        return accumulator + session.totalWaitTime;
    }, 0);

    const totalAssignedQuestions = sessions.reduce((accumulator, session) => {
        return accumulator + session.assignedQuestions;
    }, 0);

    // Bar Chart
    const sessionQuestionDict: { 
        [id: string]: {
            ta: string;
            location: string;
            startHour: string;
            endHour: string;
        };} = {}

    let chartYMax = (questions[busiestSessionIndex] && questions[busiestSessionIndex].length) || 0;

    const barGraphData: BarDatum[] = [];
    const questionsByDay: number[] = [];
    for (let i = 0; i < sessions.length; i++) {
        const session = sessions[i];
        sessionQuestionDict[session.sessionId] = {
            ta: session.tas.join(", "),
            startHour: moment(session.startTime.seconds * 1000).format("h:mm a"),
            endHour: moment(session.endTime.seconds * 1000).format("h:mm a"),
            location: (session.modality === "virtual" || session.modality === "review") ? "Online" : session.building,
        };
        const x = moment(session.startTime.seconds * 1000).format("MMM D");
        const y = questions[i] ? questions[i].length : 0;
        const lastIndex = barGraphData.length - 1;
        if (barGraphData[lastIndex]?.x === x) {
            barGraphData[lastIndex][session.sessionId] = y;
            questionsByDay[questionsByDay.length - 1] += y;
            chartYMax = Math.max(chartYMax, questionsByDay[questionsByDay.length - 1]);
        } else {
            barGraphData.push({x});
            barGraphData[lastIndex + 1][session.sessionId] = y;
            questionsByDay.push(y);
            chartYMax = Math.max(chartYMax, y);
        }
    }

    return (
        <div className="ProfessorView">
            <ProfessorSidebar courseId={courseId} code={(course && course.code) || "Loading"} selected={"people"} />
            <TopBar courseId={courseId} context="professor" role="professor" />
            <section className="rightOfSidebar">
                <div className="main">
                    <div className="Date-picker-container">
                        <DateRangePicker
                            isOutsideRange={() => false}
                            startDate={startDate}
                            startDateId="start1"
                            endDate={endDate}
                            endDateId="end1"
                            onDatesChange={({ startDate: newStartDate, endDate: newEndDate }) => {
                                if (newStartDate) {
                                    setStartDate(newStartDate);
                                }
                                if (newEndDate) {
                                    setEndDate(newEndDate);
                                }
                            }}
                            focusedInput={focusedInput}
                            onFocusChange={(newFocusedInput) => setFocusedInput(newFocusedInput)}
                        />
                    </div>
                    {totalQuestions > 0 ? (
                        <div>
                            <div className="first-row-container">
                                <div className="Total-Questions-Box">
                                    <QuestionsPieChart
                                        percentResolved={percentResolved}
                                        percentUnresolved={percentUnresolved}
                                    />
                                    <div className="percent-overlay">
                                        <p>
                                            <span className="Question-Percent"> {percentResolved}% </span>
                                            <br /> answered
                                        </p>
                                    </div>
                                    <div className="q-total-container">
                                        <p>
                                            <span className="Question-Number"> {totalQuestions} </span>
                                            <br /> questions total
                                        </p>
                                    </div>
                                </div>
                                {/* <div className="questions-bar-container">
                                    <div className="bar-graph">
                                        <QuestionsBarChart
                                            barData={barGraphData}
                                            sessionKeys={sessions.map((s) => s.sessionId)}
                                            sessionDict={sessionDict}
                                            yMax={chartYMax}
                                            calcTickVals={calcTickVals}
                                        />
                                    </div>
                                </div> */}
                            </div>
                            <div className="Most-Crowded-Box">
                                {busiestSessionInfo && (
                                    <div className="most-crowded-text">
                                        <div>
                                            <p className="crowd-title"> Most Crowded Day </p>
                                            <p className="maroon-date">
                                                {busiestSessionInfo.dayOfWeek}, <br /> {busiestSessionInfo.date}
                                            </p>
                                        </div>
                                        <hr />
                                        <div>
                                            <p className="crowd-title"> Most Crowded Office Hour </p>
                                            <p className="maroon-date">{busiestSessionInfo.ohDate}</p>
                                            <p className="maroon-descript">
                                                {busiestSessionInfo.startHour} - {busiestSessionInfo.endHour}
                                            </p>
                                            {busiestSessionInfo.online ? (
                                                <p className="maroon-descript">Online</p>
                                            ) : (
                                                <p className="maroon-descript">
                                                    {busiestSessionInfo.building} {busiestSessionInfo.room}
                                                </p>
                                            )}
                                            <p className="maroon-descript">{busiestSessionInfo.taNames}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="questions-line-container">
                                    <QuestionsBarGraph
                                        barData={barGraphData}
                                        yMax={chartYMax}
                                        sessionKeys={sessions.map((s) => s.sessionId)}
                                        calcTickVals={calcTickVals}
                                        legend="questions"
                                        sessionDict={sessionQuestionDict}
                                    />
                                </div>
                            </div>
                            <div className="Most-Crowded-Box">
                                <div className="most-crowded-text">
                                    <div>
                                        <p className="crowd-title">Average Wait Time</p>
                                        <p className="maroon-date">
                                            {totalAssignedQuestions ?
                                                `${(totalWaitTime / totalAssignedQuestions / 60).toFixed(2)} minutes`
                                                : "Not applicable"}
                                        </p>
                                    </div>
                                </div>
                                <div className="questions-line-container">
                                    <QuestionsLineChart
                                        lineData={averageWaitTimeLineChartQuestionsTest}
                                        yMax={averageWaitTimeMax}
                                        calcTickVals={calcTickVals}
                                        legend="minutes"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-question-warning">
                            <p>
                                No questions were asked during the selected time range.
                                <br /> Please select a new time range.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ProfessorPeopleView;
