import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { combineLatest, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import moment from 'moment';
import { DateRangePicker } from 'react-dates';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import QuestionsPieChart from '../includes/QuestionsPieChart';
import QuestionsLineChart from '../includes/QuestionsLineChart';
import QuestionsBarChart from '../includes/QuestionsBarChart';
// import AverageWaitTimes from '../includes/AverageWaitTimes';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { useMyUser, useCourse, useCourseUsersMap } from '../../firehooks';
import TopBar from '../includes/TopBar';
import { firestore, collectionData } from '../../firebase';

const ProfessorPeopleView = (props: RouteComponentProps<{ courseId: string }>) => {
    const courseId = props.match.params.courseId;

    const [startDate, setStartDate] = useState(moment(new Date()).add(-4, 'months'));
    const [endDate, setEndDate] = useState(moment(new Date()));
    const [focusedInput, setFocusedInput] = useState<'endDate' | 'startDate' | null>(null);

    const user = useMyUser();
    const course = useCourse(courseId);
    const courseUsers = useCourseUsersMap(courseId, true);

    const [sessions, setSessions] = useState<FireSession[]>([]);
    const [questions, setQuestions] = useState<FireQuestion[][]>([]);

    // Fetch sessions for course between dates
    useEffect(
        () => {
            const sessions$: Observable<FireSession[]> = collectionData(
                firestore
                    .collection('sessions')
                    .where('startTime', '>=', startDate.toDate())
                    .where('startTime', '<=', endDate.add(1, 'day').toDate())
                    .where('courseId', '==', courseId),
                'sessionId'
            );
            const s1 = sessions$.subscribe(newSessions => setSessions(newSessions));

            // Fetch all questions for given sessions
            const questions$ = sessions$.pipe(
                switchMap(s =>
                    combineLatest(...s.map(session =>
                        collectionData(
                            firestore
                                .collection('questions')
                                .where('sessionId', '==', session.sessionId),
                            'questionId'
                        )
                    ))
                )
            );

            const s2 = questions$.subscribe((newQuestions: FireQuestion[][]) => setQuestions(newQuestions));
            return () => {
                s1.unsubscribe();
                s2.unsubscribe();
            };
        },
        [courseId, startDate, endDate]
    );

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
        ohDate: moment(busiestSession.startTime.seconds * 1000).format('MMMM Do'),
        startHour: moment(busiestSession.startTime.seconds * 1000).format('h:mm a'),
        endHour: moment(busiestSession.endTime.seconds * 1000).format('h:mm a'),
        building: busiestSession.building,
        room: busiestSession.room,
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

    // Bar Chart
    const sessionDict: {
        [key: string]: {
            ta: string;
            questions: number;
            answered: number;
            startHour: string;
            endHour: string;
            building: string;
            room: string;
        };
    } = {};

    sessions.forEach((t, i) => {
        sessionDict[t.sessionId] = {
            // Ryan Todo
            ta: '',
            questions: questions[i] ? questions[i].length : 0,
            answered: questions[i] && questions[i].filter(q => q.status !== 'unresolved').length,
            startHour: moment(t.startTime.seconds * 1000).format('h:mm a'),
            endHour: moment(t.endTime.seconds * 1000).format('h:mm a'),
            building: t.building,
            room: t.room
        };
    });

    const barGraphData = sessions.map((s, i) => ({ [s.sessionId]: questions[i] ? questions[i].length : 0 }));

    return (
        <div className="ProfessorView">
            <ProfessorSidebar courseId={courseId} code={(course && course.code) || 'Loading'} selected={3} />
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
                                            <p className="maroon-descript">
                                                {busiestSessionInfo.building} {busiestSessionInfo.room}
                                            </p>
                                            <p className="maroon-descript">
                                                {busiestSessionInfo.taNames}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="questions-line-container">
                                    <QuestionsLineChart
                                        lineData={lineChartQuestions}
                                    />
                                </div>
                                {/* <div className="Average-Wait-Box">
                                     <div className="average-time-bar-container">
                                         <AverageWaitTimes
                                             barData={[
                                                 { date: 'Sep 29', time: 10, questions: 60 },
                                                 { date: 'Oct 6', time: 5, questions: 100 },
                                                 { date: 'Oct 13', time: 1, questions: 10 },
                                                 { date: 'Oct 19', time: 14, questions: 28 },
                                                 { date: 'Oct 20', time: 18, questions: 50 },
                                                 { date: 'Oct 27', time: 20, questions: 15 },
                                                 { date: 'Nov 2', time: 11, questions: 22 },
                                                 { date: 'Nov 3', time: 13, questions: 43 },
                                                 { date: 'Nov 9', time: 14, questions: 11 },
                                                 { date: 'Nov 10', time: 11, questions: 51 },
                                                 { date: 'Nov 16', time: 10, questions: 19 },
                                                 { date: 'Nov 17', time: 3, questions: 21 },
                                                 { date: 'Nov 23', time: 9, questions: 24 },
                                                 { date: 'Nov 24', time: 19, questions: 66 }
                                             ]}
                                         />
                                     </div>
                                     <div className="average-wait-text">
                                         <div>
                                             <p className="average-wait-title">Average Wait Times</p>
                                         </div>
                                     </div>
                                 </div> */}
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
