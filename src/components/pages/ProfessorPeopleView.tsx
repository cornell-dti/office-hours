import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import moment from 'moment';
import { DateRangePicker } from 'react-dates';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import QuestionsPieChart from '../includes/QuestionsPieChart';
import QuestionsLineChart from '../includes/QuestionsLineChart';
import QuestionsBarChart from '../includes/QuestionsBarChart';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { useMyUser, useCourse, useCourseUsersMap , useCoursesBetweenDates } from '../../firehooks';
import TopBar from '../includes/TopBar';
import { firestore } from '../../firebase';

const ProfessorPeopleView = (props: RouteComponentProps<{ courseId: string }>) => {
    const courseId = props.match.params.courseId;

    const [startDate, setStartDate] = useState(moment(new Date()).add(-4, 'months'));
    const [endDate, setEndDate] = useState(moment(new Date()));
    const [focusedInput, setFocusedInput] = useState<'endDate' | 'startDate' | null>(null);

    const user = useMyUser();
    const course = useCourse(courseId);
    const courseUsers = useCourseUsersMap(courseId, true);
    // Fetch sessions for course between dates
    const {sessions, questions} = useCoursesBetweenDates(firestore, startDate, endDate, courseId)

    // Compute necessary data
    // Aggregate Stats
    const allQuestions = questions.flat();
    const totalQuestions = allQuestions.length;
    const unresolvedQuestions = allQuestions.filter(q => q.status === 'unresolved');
    const percentUnresolved = Math.round(100 * unresolvedQuestions.length / totalQuestions);
    const percentResolved = 100 - percentUnresolved;

    // Busiest Session Data
    const busiestSessionIndex = questions.reduce(
        (busiestIndex, currentQs, i, arr) =>
            currentQs.length > arr[busiestIndex].length ? i : busiestIndex,
        0
    );

    const busiestSession: FireSession | undefined = sessions[busiestSessionIndex];
    const busiestSessionInfo = busiestSession && {
        ...('building' in busiestSession ? {
            building: busiestSession.building, room: busiestSession.room, online: false as const
        } : { online: true as const }),
        ohDate: moment(busiestSession.startTime.seconds * 1000).format('MMMM Do'),
        startHour: moment(busiestSession.startTime.seconds * 1000).format('h:mm a'),
        endHour: moment(busiestSession.endTime.seconds * 1000).format('h:mm a'),
        dayOfWeek: moment(busiestSession.startTime.seconds * 1000).format('dddd'),
        date: moment(busiestSession.startTime.seconds * 1000).format('MMMM Do YYYY'),
        taNames: busiestSession.tas.map(userId => {
            const courseUser = courseUsers[userId];
            if (courseUser === undefined) {
                return 'unknown';
            }
            return `${courseUser.firstName} ${courseUser.lastName}`;
        }).join(', ')
    };

    // Line Chart
    const lineChartQuestions = questions.length > 0
        ? sessions.map((s, i) => ({
            'x': moment(s.startTime.seconds * 1000).format('MMM D'),
            'y': questions[i].length
        }))
        : [];

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

    // Bar Chart
    const sessionDict: {
        [key: string]: {
            ta: string;
            online: true;
            questions: number;
            answered: number;
            startHour: string;
            endHour: string;
        };
    } | {
        [key: string]: {
            ta: string;
            online: false;
            questions: number;
            answered: number;
            startHour: string;
            endHour: string;
            building: string;
            room: string;
        };
    } = {};

    sessions.forEach((t, i) => {
        if (t.modality === "virtual" || t.modality === "review") {
            sessionDict[t.sessionId] = {
                // Ryan Todo
                ta: '',
                questions: questions[i] ? questions[i].length : 0,
                answered: questions[i] && questions[i].filter(q => q.status !== 'unresolved').length,
                startHour: moment(t.startTime.seconds * 1000).format('h:mm a'),
                endHour: moment(t.endTime.seconds * 1000).format('h:mm a'),
                online: true,

            };
        } else {
            sessionDict[t.sessionId] = {
                // Ryan Todo
                ta: '',
                questions: questions[i] ? questions[i].length : 0,
                answered: questions[i] && questions[i].filter(q => q.status !== 'unresolved').length,
                startHour: moment(t.startTime.seconds * 1000).format('h:mm a'),
                endHour: moment(t.endTime.seconds * 1000).format('h:mm a'),
                online: false,
                building: t.building,
                room: t.room
            };
        }
    });

    const barGraphData = sessions.map((s, i) => ({ [s.sessionId]: questions[i] ? questions[i].length : 0 }));

    const chartYMax = (questions[busiestSessionIndex] && questions[busiestSessionIndex].length) || 0;
    return (
        <div className="ProfessorView">
            <ProfessorSidebar courseId={courseId} code={(course && course.code) || 'Loading'} selected={'people'} />
            <TopBar courseId={courseId} user={user} context="professor" role="professor" />
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
                                if (newStartDate) { setStartDate(newStartDate); }
                                if (newEndDate) { setEndDate(newEndDate); }
                            }}
                            focusedInput={focusedInput}
                            onFocusChange={newFocusedInput => setFocusedInput(newFocusedInput)}
                        />
                    </div>
                    {totalQuestions > 0
                        ? (<div>
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
                                <div className="questions-bar-container">
                                    <div className="bar-graph">
                                        <QuestionsBarChart
                                            barData={barGraphData}
                                            sessionKeys={sessions.map(s => s.sessionId)}
                                            sessionDict={sessionDict}
                                            yMax={chartYMax}
                                            calcTickVals={calcTickVals}
                                        />
                                    </div>
                                </div>
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
                                            <p className="maroon-descript">
                                                {busiestSessionInfo.ohDate}
                                            </p>
                                            <p className="maroon-descript">
                                                {busiestSessionInfo.startHour} - {busiestSessionInfo.endHour}
                                            </p>
                                            {busiestSessionInfo.online ? <p className="maroon-descript">Online</p> :
                                                <p className="maroon-descript">
                                                    {busiestSessionInfo.building} {busiestSessionInfo.room}
                                                </p>}
                                            <p className="maroon-descript">
                                                {busiestSessionInfo.taNames}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="questions-line-container">
                                    <QuestionsLineChart
                                        lineData={lineChartQuestions}
                                        yMax={chartYMax}
                                        calcTickVals={calcTickVals}
                                    />
                                </div>
                            </div>
                        </div>)
                        : (<div className="no-question-warning">
                            <p>
                                No questions were asked during the selected time range.
                                <br /> Please select a new time range.
                            </p>
                        </div>)
                    }
                </div>
            </section>
        </div>
    );
};

export default ProfessorPeopleView;
