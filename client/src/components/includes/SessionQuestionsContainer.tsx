import * as React from 'react';
import SessionQuestionsComponent from './SessionQuestionsComponent';

class SessionQuestionsContainer extends React.Component {
    props: {
        isTA: boolean,
        sessionId: number,
        questions: Question[],
    };

    render() {
        var questions = this.props.questions;
        var userQuestionIndex: number = 0;
        var cardList: JSX.Element[] = [];
        questions.forEach((question, i: number) => {
            if (question.userId === 100) {
                userQuestionIndex = i;
            }
            cardList.push(
                <SessionQuestionsComponent
                    key={question.id}
                    questionId={question.id}
                    sessionId={this.props.sessionId}
                    studentName={question.name}
                    studentPicture={'https://i2.wp.com/puppypassionn.org/wp-content/' +
                        'uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1'}
                    studentQuestion={question.content}
                    time={question.timeEntered}
                    tags={question.tags}
                    index={i}
                    isTA={this.props.isTA}
                    isMyQuestion={false}
                />
            );
        });

        return (
            <div className="SessionQuestionsContainer" >
                {!this.props.isTA && questions.length > 0 && userQuestionIndex !== -1 &&
                    <div className="User">
                        <div className="UserQuestionHeader">
                            <p className="QuestionHeader">My Question</p>
                        </div>
                        {
                            <SessionQuestionsComponent
                                key={questions[userQuestionIndex].id}
                                questionId={questions[userQuestionIndex].id}
                                sessionId={this.props.sessionId}
                                studentName={questions[userQuestionIndex].name}
                                studentPicture={'https://i2.wp.com/puppypassionn.org/wp-content/' +
                                    'uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1'}
                                studentQuestion={questions[userQuestionIndex].content}
                                time={questions[userQuestionIndex].timeEntered}
                                tags={questions[userQuestionIndex].tags}
                                index={userQuestionIndex}
                                isTA={this.props.isTA}
                                isMyQuestion={true}
                            />
                        }
                    </div>
                }
                <div>
                    <p className="Queue">Queue</p>
                </div>
                {questions.length > 0 && cardList}
                {
                    questions.length === 0 &&
                    (!this.props.isTA &&
                        <p className="noQuestionsWarning">No questions in the queue. Be the first!</p>
                        ||
                        <p className="noQuestionsWarning">No questions in the queue yet.</p>)
                }

            </div>
        );
    }
}

export default SessionQuestionsContainer;
