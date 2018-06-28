import * as React from 'react';
import SessionQuestionsComponent from './SessionQuestionsComponent';
import { Icon } from 'semantic-ui-react';

class SessionQuestionsContainer extends React.Component {
    props: {
        isTA: boolean,
        sessionId: number,
        questions: Question[],
        myUserId: number,
        handleJoinClick: Function,
    };

    render() {
        var questions = this.props.questions;
        var userQuestionIndex: number = -1;
        var cardList: JSX.Element[] = [];
        questions.forEach((question, i: number) => {
            if (question.userId === this.props.myUserId) {
                userQuestionIndex = i;
            }
            cardList.push(
                <SessionQuestionsComponent
                    key={question.id}
                    questionId={question.id}
                    studentName={question.name}
                    studentPicture={question.photoUrl}
                    studentQuestion={question.content}
                    time={question.timeEntered}
                    tags={question.tags}
                    index={i}
                    isTA={this.props.isTA}
                    isMyQuestion={userQuestionIndex === i && !this.props.isTA}
                />
            );
        });

        return (

            <div className="SessionQuestionsContainer" >
                {!this.props.isTA && userQuestionIndex === -1 &&
                    <div className="SessionJoinButton" onClick={() => this.props.handleJoinClick()}>
                        <p><Icon name="plus" /> Join the Queue</p>
                    </div>
                }
                {!this.props.isTA && questions.length > 0 && userQuestionIndex !== -1 &&
                    <div className="User">
                        <p className="QuestionHeader">My Question</p>
                        {
                            <SessionQuestionsComponent
                                key={questions[userQuestionIndex].id}
                                questionId={questions[userQuestionIndex].id}
                                studentName={questions[userQuestionIndex].name}
                                studentPicture={questions[userQuestionIndex].photoUrl}
                                studentQuestion={questions[userQuestionIndex].content}
                                time={questions[userQuestionIndex].timeEntered}
                                tags={questions[userQuestionIndex].tags}
                                index={userQuestionIndex}
                                isTA={this.props.isTA}
                                isMyQuestion={true}
                            />
                        }
                        <p className="Queue">Queue</p>
                    </div>
                }
                {questions.length > 0 &&
                    <React.Fragment>
                        {cardList}
                    </React.Fragment>
                }
                {
                    questions.length === 0 &&
                    <React.Fragment>
                        <p className="noQuestionsHeading">Queue Currently Empty</p>
                        {!this.props.isTA && (
                            <p className="noQuestionsWarning">Be the first to join the queue!</p>
                            ||
                            <p className="noQuestionsWarning">No questions in the queue yet.</p>)
                        }
                    </React.Fragment>

                }

            </div>
        );
    }
}

export default SessionQuestionsContainer;
