import * as React from 'react';
import SessionQuestionsComponent from './SessionQuestionsComponent';
import { Icon } from 'semantic-ui-react';

class SessionQuestionsContainer extends React.Component {
    props: {
        isTA: boolean,
        sessionId: number,
        questions: Question[],
        handleJoinClick: Function,
    };

    render() {
        var questions = this.props.questions;
        var userQuestionIndex: number = -1;
        var cardList: JSX.Element[] = [];
        questions.forEach((question, i: number) => {
            // TODO: change before shipping
            if (question.userId === 7) {
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
                    isMyQuestion={userQuestionIndex === i && !this.props.isTA}
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
