import * as React from 'react';
// import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import QuestionsPieChart from '../includes/QuestionsPieChart';
// import QuestionsLineChart from '../includes/QuestionsLineChart';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Redirect } from 'react-router';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import * as moment from 'moment';
import TopBar from '../includes/TopBar';
// import { Loader } from 'semantic-ui-react';

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
              userId
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
      nodes: [ AppSession ]
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
              courseId: number;
          }
      }
  };

  state: {
    startDate: moment.Moment;
    endDate: moment.Moment;
    focusedInput: 'endDate' | 'startDate' | null ;
  };

  constructor(props: {}) {
      super(props);
      this.state = {
        startDate: moment(new Date()).add(-9, 'months'),
        endDate: moment(new Date()),
        focusedInput: null
      };
  }

  render() {
      return (
          <div className="ProfessorPeopleView">
              <ProfessorMetadataDataQuery
                  query={METADATA_QUERY}
                  variables={{
                      courseId: this.props.match.params.courseId,
                      startDate: moment(this.state.startDate).format('YYYY-MM-DD'),
                      endDate: moment(this.state.endDate).format('YYYY-MM-DD')
                  }}
              >
                  {({ loading, data }) => {
                      var courseCode: string = 'Loading...';
                      var resolvedQuestions: number = 0;
                      var unresolvedQuestions: number = 0;
                      let percentResolved: number = 0;
                      let percentUnresolved: number = 0;
                      let totalQuestions: number = 0;
                      let questionsInBusiestSession: number = 0;
                      let questionsByDate: {date: string, questions: number}[] = [];
                      let mostCrowdedDay: string = '';
                      let busiestSessionInfo: {
                        taId: number,
                        firstName: string,
                        lastName: string,
                        startTime: string,
                        endTime: string,
                        building: string,
                        room: string
                      } = {
                        taId: 0,
                        firstName: '',
                        lastName: '',
                        startTime: '',
                        endTime: '',
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
                            n.questionsBySessionId.nodes.forEach((q) => {
                              totalQuestions++;
                              questionsInThisSession++;
                              if (q.status === 'resolved' || q.status === 'retracted') {
                                resolvedQuestions++;
                              } else if (q.status === 'unresolved') {
                                unresolvedQuestions++;
                              }
                            });
                            if (questionsInThisSession >= questionsInBusiestSession) {
                              questionsInBusiestSession = questionsInThisSession;
                              busiestSessionInfo.taId = n.sessionTasBySessionId.nodes[0].userByUserId.userId;
                              busiestSessionInfo.firstName = '';
                              busiestSessionInfo.lastName = '';
                              busiestSessionInfo.startTime = moment(n.startTime).format('MMMM Do YYYY, h:mm a');
                              busiestSessionInfo.endTime = moment(n.endTime).format('h:mm a');
                              busiestSessionInfo.building = n.building;
                              busiestSessionInfo.room = n.room;
                            }
                            let dateString = moment(n.startTime).format('MMMM Do YYYY');
                            if (dateString in questionsByDate) {
                              questionsByDate[dateString].questions += questionsInThisSession;
                            } else {
                              questionsByDate.push({date: dateString, questions: questionsInThisSession});
                            }
                          });
                          percentResolved = Math.round((resolvedQuestions /
                          (resolvedQuestions + unresolvedQuestions)) * 100);
                          percentUnresolved = 100 - percentResolved;
                          let questionsOfBusiestDay = 0;
                          questionsByDate.forEach((d) => {
                            if (d.questions >= questionsOfBusiestDay) {
                              mostCrowdedDay = d.date;
                              questionsOfBusiestDay = d.questions;
                            }
                          });
                      }
                      return (
                          <React.Fragment>
                              <ProfessorSidebar
                                  courseId={this.props.match.params.courseId}
                                  code={courseCode}
                                  selected={3}
                              />
                              {data && data.apiGetCurrentUser &&
                                  <TopBar
                                      courseId={this.props.match.params.courseId}
                                      user={data.apiGetCurrentUser.nodes[0]}
                                      context="professor"
                                      role={data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role}
                                  />
                                }
                                <div className="Date-picker-container">
                              <DateRangePicker

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
                            <div className="Total-Questions-Box">
                                <QuestionsPieChart
                                    percentResolved={percentResolved}
                                    percentUnresolved={percentUnresolved}
                                />
                                <div>
                                  <p> <span className="Question-Number">{totalQuestions} </span>
                                  <br/> questions total</p>
                                </div>
                            </div>
                            <div className="Most-Crowded-Box">
                                <div>
                                  <p> Most Crowded Day </p>
                                  <p> {mostCrowdedDay} </p>
                                </div>
                                <hr/>
                                <div>
                                  <p> Most Crowded Office Hour </p>
                                  <p> {busiestSessionInfo.startTime} - {busiestSessionInfo.endTime} </p>
                                  <p> {busiestSessionInfo.building} {busiestSessionInfo.room} </p>
                                </div>
                                {/* <QuestionsLineChart /> */}
                            </div>
                          </React.Fragment>
                      );
                  }}
              </ProfessorMetadataDataQuery>

          </div>
      );
  }
}

export default ProfessorPeopleView;
