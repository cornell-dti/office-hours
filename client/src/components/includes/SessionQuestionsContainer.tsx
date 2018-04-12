import * as React from 'react';
import SessionQuestionsComponent from './SessionQuestionsComponent';

class SessionQuestionsContainer extends React.Component {
    props: {
        isTA: boolean,
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
                    studentName={question.name}
                    studentPicture={'https://i2.wp.com/puppypassionn.org/wp-content/' +
                        'uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1'}
                    studentQuestion={question.content}
                    time={question.timeEntered}
                    tags={question.tags}
                    index={i}
                    isTA={this.props.isTA}
                />
            );
        });

        var tagsList: JSX.Element[] = [];
        if (questions.length > 0 && userQuestionIndex !== -1) {
            tagsList = questions[userQuestionIndex].tags.map(
                (tag) => {
                    return <p key={tag.id}>{tag.name}</p>;
                }
            );
        }

        return (
            <div className="SessionQuestionsContainer" >
                {questions.length > 0 && userQuestionIndex !== -1 &&
                    <div className="User">
                        <div className="UserQuestionHeader">
                            <p className="QuestionHeader">My Question</p>
                        </div>
                        <div className="UserQuestion">
                            <p className="Question">{questions[userQuestionIndex].content}</p>
                            <div className="Tags">
                                {tagsList}
                            </div>
                            <div className="BottomBar">
                                <p className="Order">{userQuestionIndex}</p>
                                <p className="Time">{questions[userQuestionIndex].timeEntered}</p>
                            </div>
                            <div className="Buttons">
                                <hr />
                                <p className="Delete">X Remove</p>
                            </div>
                        </div>
                    </div>
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
