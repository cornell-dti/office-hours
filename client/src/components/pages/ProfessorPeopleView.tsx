import * as React from 'react';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import QuestionsPieChart from '../includes/QuestionsPieChart';
import QuestionsLineChart from '../includes/QuestionsLineChart';
import QuestionsBarChart from '../includes/QuestionsBarChart';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Redirect } from 'react-router';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import * as moment from 'moment';
import TopBar from '../includes/TopBar';

const METADATA_QUERY = gql`
query GetMetadata($courseId: Int!, $startDate: Datetime!, $endDate: Datetime!) {
    apiGetCurrentUser {
        nodes {
            computedName
            computedAvatar
            courseUsersByUserId(condition:{courseId:$courseId}) {
                nodes {
                    role
                }
            }
        }
    }
    courseByCourseId(courseId: $courseId) {
        code
    }

    apiGetSessions(
      _beginTime: $startDate,
      _endTime: $endDate,
      _courseId: $courseId
    ){
      nodes{
        sessionId
        startTime
        endTime
        building
        room
        questionsBySessionId{
          nodes{
            status
          }
        }
        sessionTasBySessionId{
         nodes{
            userByUserId{
                computedName
            }
         }
       }

     }

 }
}`;

interface ProfessorMetadataData {
    apiGetCurrentUser: {
        nodes: [AppUserRole]
    };
    courseByCourseId: {
        code: string
    };
    apiGetSessions: {
        nodes: [AppSession]
    };
}

interface MetadataVariables {
    courseId: number;
    startDate: string;
    endDate: string;
}

class ProfessorMetadataDataQuery extends Query<ProfessorMetadataData, MetadataVariables> { }

class ProfessorPeopleView extends React.Component {
    props: {
        match: {
            params: {
                courseId: string;
            }
        }
    };

    state: {
        startDate: moment.Moment;
        endDate: moment.Moment;
        focusedInput: 'endDate' | 'startDate' | null;
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            startDate: moment(new Date()).add(-4, 'months'),
            endDate: moment(new Date()),
            focusedInput: null
        };
    }

    calcTickVals(yMax: number) {
        if (yMax === 0) {
            return [0];
        }
        let end = yMax + (6 - (yMax % 6));
        let start = 0;
        let step = end / 6;
        let tickVals = [];
        while ((end + step) >= start) {
            tickVals.push(start);
            start += step;
        }
        return tickVals;
    }

    render() {
        let courseId = parseInt(this.props.match.params.courseId, 10);
        return (
            <div className="ProfessorView">
                <ProfessorMetadataDataQuery
                    query={METADATA_QUERY}
                    variables={{
                        courseId: courseId,
                        startDate: moment(this.state.startDate).format('YYYY-MM-DD'),
                        endDate: moment(this.state.endDate).format('YYYY-MM-DD')
                    }}
                >
                    {({ loading, data }) => {
                        var courseCode: string = 'Loading...';
                        var resolvedQuestions: number = 0;
                        let percentResolved: number = 0;
                        let percentUnresolved: number = 0;
                        let totalQuestions: number = 0;
                        let questionsInBusiestSession: number = 0;
                        let questionsByDate: {
                            date: string,
                            DOW: string,
                            totalQuestions: number,
                            calendar: string,
                            sessionQuestions: {
                                ta: string,
                                sessionId: number,
                                questions: number,
                                answered: number,
                                startHour: string,
                                endHour: string,
                                building: string,
                                room: string
                            }[]
                        }[] = [];
                        let mostCrowdedDay: string = '';
                        let mostCrowdedDOW: string = '';
                        let lineQuestionsPerDay: {
                            'x': string,
                            'y': number
                        }[] = [];
                        let questionsOfBusiestDay: number = 0;
                        let barGraphData: {}[] = [];
                        let sessionIdList: string[] = [];
                        let sessionDict = {};
                        let busiestSessionInfo: {
                            taName: string,
                            ohDate: string,
                            startHour: string,
                            endHour: string,
                            building: string,
                            room: string
                        } = {
                            taName: '',
                            ohDate: '',
                            startHour: '',
                            endHour: '',
                            building: '',
                            room: ''
                        };
                        if (!loading && data) {
                            courseCode = data.courseByCourseId.code;
                            if (data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role !== 'professor') {
                                return <Redirect to={'/course/' + this.props.match.params.courseId} />;
                            }
                            data.apiGetSessions.nodes.forEach((n) => {
                                let questionsInThisSession = 0;
                                var resolvedInThisSession = 0;
                                n.questionsBySessionId.nodes.forEach((q) => {
                                    totalQuestions++;
                                    questionsInThisSession++;
                                    if (q.status === 'resolved' || q.status === 'retracted') {
                                        resolvedQuestions++;
                                        resolvedInThisSession++;
                                    }
                                });
                                if (questionsInThisSession >= questionsInBusiestSession) {
                                    questionsInBusiestSession = questionsInThisSession;
                                    busiestSessionInfo.taName =
                                        n.sessionTasBySessionId.nodes[0].userByUserId.computedName;
                                    busiestSessionInfo.ohDate = moment(n.startTime).format('MMMM Do');
                                    busiestSessionInfo.startHour = moment(n.startTime).format('h:mm a');
                                    busiestSessionInfo.endHour = moment(n.endTime).format('h:mm a');
                                    busiestSessionInfo.building = n.building;
                                    busiestSessionInfo.room = n.room;
                                }
                                let dateString = moment(n.startTime).format('MMMM Do YYYY');
                                let dateOfWeek = moment(n.startTime).format('dddd');
                                let calString = moment(n.startTime).format('MMM D');
                                let newDate = true;
                                let newSessionObj = {
                                    ta: n.sessionTasBySessionId.nodes[0] &&
                                        n.sessionTasBySessionId.nodes[0].userByUserId.computedName ||
                                        'No TA Assigned',
                                    sessionId: n.sessionId,
                                    questions: questionsInThisSession,
                                    answered: resolvedInThisSession,
                                    startHour: moment(n.startTime).format('h:mm a'),
                                    endHour: moment(n.endTime).format('h:mm a'),
                                    building: n.building,
                                    room: n.room
                                };
                                questionsByDate.forEach((d) => {
                                    if (d.date === dateString) {
                                        d.totalQuestions += questionsInThisSession;
                                        d.sessionQuestions.push(newSessionObj);
                                        newDate = false;
                                    }
                                });
                                if (questionsInThisSession > 0) {
                                    sessionIdList.push(String(n.sessionId));
                                }
                                if (newDate) {
                                    questionsByDate.push({
                                        date: dateString,
                                        DOW: dateOfWeek,
                                        totalQuestions: questionsInThisSession,
                                        calendar: calString,
                                        sessionQuestions: [newSessionObj]
                                    });
                                }
                            });
                            percentResolved = Math.round((resolvedQuestions /
                                (totalQuestions)) * 100);
                            percentUnresolved = 100 - percentResolved;
                            questionsByDate.forEach((d) => {
                                if (d.totalQuestions >= questionsOfBusiestDay) {
                                    mostCrowdedDay = d.date;
                                    mostCrowdedDOW = d.DOW;
                                    questionsOfBusiestDay = d.totalQuestions;
                                }
                                // alert(d.questions);
                                lineQuestionsPerDay.push({
                                    'x': d.calendar,
                                    'y': d.totalQuestions
                                });
                                let newBar = {
                                    'date': d.calendar
                                };
                                d.sessionQuestions.forEach((t) => {
                                    newBar[String(t.sessionId)] = t.questions;
                                    sessionDict[String(t.sessionId)] = {
                                        ta: t.ta,
                                        questions: t.questions,
                                        answered: t.answered,
                                        startHour: t.startHour,
                                        endHour: t.endHour,
                                        building: t.building,
                                        room: t.room
                                    };
                                });
                                barGraphData.push(newBar);

                            });
                        }
                        return (
                            <React.Fragment>
                                <ProfessorSidebar
                                    courseId={courseId}
                                    code={courseCode}
                                    selected={3}
                                />
                                {data && data.apiGetCurrentUser &&
                                    <TopBar
                                        courseId={courseId}
                                        user={data.apiGetCurrentUser.nodes[0]}
                                        context="professor"
                                        role={data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role}
                                    />
                                }
                                <section className="rightOfSidebar">
                                    <div className="main">
                                        <div className="Date-picker-container">
                                            <DateRangePicker
                                                isOutsideRange={() => false}
                                                startDate={this.state.startDate} // momentPropTypes.momentObj or null,
                                                startDateId="start1" // PropTypes.string.isRequired,
                                                endDate={this.state.endDate} // momentPropTypes.momentObj or null,
                                                endDateId="end1" // PropTypes.string.isRequired,
                                                onDatesChange={
                                                    ({ startDate, endDate }) => this.setState({ startDate, endDate })}
                                                focusedInput={this.state.focusedInput}
                                                onFocusChange={focusedInput => this.setState({ focusedInput })}
                                            />
                                        </div>
                                        {totalQuestions > 0 ?
                                            <div>
                                                <div className="first-row-container">
                                                    <div className="Total-Questions-Box">
                                                        <QuestionsPieChart
                                                            percentResolved={percentResolved}
                                                            percentUnresolved={percentUnresolved}
                                                        />
                                                        <div className="percent-overlay">
                                                            <p> <span className="Question-Percent">
                                                                {percentResolved}%</span>
                                                                <br />answered</p>
                                                        </div>
                                                        <div className="q-total-container">
                                                            <p> <span className="Question-Number">
                                                                {totalQuestions} </span>
                                                                <br /> questions total</p>
                                                        </div>
                                                    </div>
                                                    <div className="questions-bar-container">
                                                        <div className="bar-graph">
                                                            <QuestionsBarChart
                                                                barData={barGraphData}
                                                                sessionKeys={sessionIdList}
                                                                sessionDict={sessionDict}
                                                                yMax={questionsOfBusiestDay}
                                                                calcTickVals={this.calcTickVals}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="Most-Crowded-Box">
                                                    <div className="most-crowded-text">
                                                        <div>
                                                            <p className="crowd-title"> Most Crowded Day </p>
                                                            <p className="maroon-date"> {mostCrowdedDOW}, <br />
                                                                {mostCrowdedDay} </p>
                                                        </div>
                                                        <hr />
                                                        <div>
                                                            <p className="crowd-title"> Most Crowded Office Hour </p>
                                                            <p className="maroon-descript">
                                                                {busiestSessionInfo.ohDate}</p>
                                                            <p className="maroon-descript">
                                                                {busiestSessionInfo.startHour} -
                                                            {busiestSessionInfo.endHour}
                                                            </p>
                                                            <p className="maroon-descript">
                                                                {busiestSessionInfo.building} {busiestSessionInfo.room}
                                                            </p>
                                                            <p className="maroon-descript">
                                                                {busiestSessionInfo.taName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="questions-line-container">
                                                        <QuestionsLineChart
                                                            lineData={lineQuestionsPerDay}
                                                            yMax={questionsOfBusiestDay}
                                                            calcTickVals={this.calcTickVals}
                                                        />
                                                    </div>

                                                </div>
                                            </div>
                                            :
                                            <div className="no-question-warning">
                                                <p> No questions were asked during the selected time range.
                                                    <br /> Please select a new time range. </p>
                                            </div>
                                        }
                                    </div>
                                </section>
                            </React.Fragment>
                        );
                    }}
                </ProfessorMetadataDataQuery>

            </div>
        );
    }
}

export default ProfessorPeopleView;
