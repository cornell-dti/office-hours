import * as React from 'react';
import SessionQuestionsComponent from './SessionQuestionsComponent';
import DetailedQuestionView from './DetailedQuestionView';

class SessionQuestionsContainer extends React.Component {
    state: {
        isDetailed: boolean,
        index: number
    };

    props: {
        isDetailed: boolean,
<<<<<<< HEAD
        studentPicture: string[],
        studentName: string[],
        studentQuestion: string[],
        userQuestionID: number,
        tags: string[][],
        group: string[][],
        order: string[],
        times: string[],
        isTA: boolean
=======
        useFakeData: boolean,
        questions: Question[]
>>>>>>> db192cf10bf6e709cf127d33601ae47a8530ccc0
    };

    constructor(props: {}) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            isDetailed: false,
            index: 0
        };
    }

    handleClick(toggle: boolean, index: number) {
        this.setState({
            isDetailed: toggle,
            index: index
        });
    }

    render() {
<<<<<<< HEAD
        var userQuestion = this.props.studentQuestion[1]
        var userOrder = this.props.order[1]
        var userTime = this.props.times[1]
        var userTagsList = this.props.tags[1].map(
            (tag, index) => {
                return <p key={index}>{tag}</p>;
            }
        );

        var cardList = this.props.studentName.map(
            (studentName, index) => {
                return (
                    <SessionQuestionsComponent
                        key={index}
                        handleClick={this.handleClick}
                        studentPicture={this.props.studentPicture[index]}
                        studentName={this.props.studentName[index]}
                        studentQuestion={this.props.studentQuestion[index]}
                        tags={this.props.tags[index]}
                        order={this.props.order[index]}
                        times={this.props.times[index]}
                        index={index}
                        isTA={this.props.isTA}
                    />
                );
            }
        );

        return (
            <div className="SessionQuestionsContainer">
                <DetailedQuestionView
                    isDetailed={this.state.isDetailed}
                    handleClick={this.handleClick}
                    studentName={this.props.studentName[this.state.index]}
                    studentQuestion={this.props.studentQuestion[this.state.index]}
                    tags={this.props.tags[this.state.index]}
                    group={this.props.group[this.state.index]}
                />
                { (!this.props.isTA && (this.props.userQuestionID != -1)) ?
                  <div className="User">
                      <div className="UserQuestionHeader">
                          <p className="QuestionHeader">My Question</p>
                      </div>
                      <div className="UserQuestion">
                          <p className="Question">{userQuestion}</p>
                          <div className="Tags">
                              {userTagsList}
                          </div>
                          <div className="BottomBar">
                              <p className="Order">{userOrder}</p>
                              <p className="Time">{userTime}</p>
                          </div>
                          <div className="Buttons">
                            <hr/>
                            <p className="Delete">X Remove</p>
                          </div>
                      </div>
                  </div> : <div> </div>
=======
        var questions = this.props.questions;
        if (this.props.useFakeData) {
            questions = [
                {
                    id: 1,
                    name: 'Karun Singh',
                    content: 'How do you implement recursion when you try to use function used in question 4?',
                    time: new Date(Date.now()),
                    tags: [
                        { id: 1, name: 'Assignment 2' },
                        { id: 1, name: 'Q4' },
                        { id: 1, name: 'Recursion' },
                        { id: 1, name: 'Conceptual' }
                    ],
                }, {
                    id: 1,
                    name: 'Ryan Slama',
                    content: 'Can you clarify the statistics concept from the prelim?',
                    time: new Date(Date.now()),
                    tags: [
                        { id: 1, name: 'Assignment 2' },
                        { id: 1, name: 'Q4' },
                        { id: 1, name: 'Prelim' },
                        { id: 1, name: 'Statistics' }
                    ],
                }, {
                    id: 1,
                    name: 'Shefali Agarwal',
                    content: 'How can I use the given function to parse dataset 1?',
                    time: new Date(Date.now()),
                    tags: [
                        { id: 1, name: 'Assignment 2' },
                        { id: 1, name: 'Q4' },
                        { id: 1, name: 'Function' },
                        { id: 1, name: 'Dataset' }
                    ],
                }, {
                    id: 1,
                    name: 'Horace He',
                    content: 'I don’t understand how to infer the classification of causality.',
                    time: new Date(Date.now()),
                    tags: [
                        { id: 1, name: 'Assignment 2' },
                        { id: 1, name: 'Q4' },
                        { id: 1, name: 'Recursion' },
                        { id: 1, name: 'Conceptual' }
                    ],
                }, {
                    id: 1,
                    name: 'Tiffany Wang',
                    content: 'Lorem ipsum, I am running out of ideas!',
                    time: new Date(Date.now()),
                    tags: [
                        { id: 1, name: 'Assignment 2' },
                        { id: 1, name: 'Q4' },
                        { id: 1, name: 'Lorem' },
                        { id: 1, name: 'Ipsum' }
                    ],
                }, {
                    id: 1,
                    name: 'Joyelle Gilbert',
                    content: 'How do you implement recursion when you try to use function used in question 4?',
                    time: new Date(Date.now()),
                    tags: [
                        { id: 1, name: 'Assignment 2' },
                        { id: 1, name: 'Q4' },
                        { id: 1, name: 'Recursion' },
                        { id: 1, name: 'Conceptual' }
                    ],
                },
            ];
        }
        var cardList = questions.map((question: Question, index) => {
            return (
                <SessionQuestionsComponent
                    key={question.id}
                    handleClick={this.handleClick}
                    studentName={question.name}
                    studentQuestion={question.content}
                    tags={question.tags}
                    index={index}
                />
            );
        });

        return (
            <div className="SessionQuestionsContainer">
                {this.props.questions[this.state.index] &&
                    <DetailedQuestionView
                        isDetailed={this.state.isDetailed}
                        handleClick={this.handleClick}
                        studentName={this.props.questions[this.state.index].name}
                        studentQuestion={this.props.questions[this.state.index].content}
                        tags={this.props.questions[this.state.index].tags}
                    />
>>>>>>> db192cf10bf6e709cf127d33601ae47a8530ccc0
                }
                <div>
                    <p className="Queue">Queue</p>
                </div>
                {questions.length > 0 && cardList}
                {
                    questions.length === 0 &&
                    <p className="noQuestionsWarning">No questions in the queue. Be the first!</p>
                }

            </div>
        );
    }
}

export default SessionQuestionsContainer;
