import * as React from 'react';
import SessionQuestionsComponent from './SessionQuestionsComponent';
import { Icon } from 'semantic-ui-react';

class SessionQuestionsContainer extends React.Component {
    props: {
        isTA: boolean,
        questions: AppQuestion[] | null,
        handleJoinClick: Function,
    };

    render() {
        var questions = this.props.questions;
        var userQuestionIndex: number = -1;
        var cardList: JSX.Element[] = [];
        if (questions) {
            questions.forEach((question, i: number) => {
                // TODO: change before shipping
                if (question.userByAskerId.userId === 100) {
                    userQuestionIndex = i;
                }
                cardList.push(
                    <SessionQuestionsComponent
                        key={question.questionId}
                        question={question}
                        index={i}
                        isTA={this.props.isTA}
                        isMyQuestion={userQuestionIndex === i && !this.props.isTA}
                    />
                );
            });
        }

        return (

            <div className="SessionQuestionsContainer" >
                {!this.props.isTA && userQuestionIndex === -1 &&
                    <div className="SessionJoinButton" onClick={() => this.props.handleJoinClick()}>
                        <p><Icon name="plus" /> Join the Queue</p>
                    </div>
                }
                {!this.props.isTA && questions && questions.length > 0 && userQuestionIndex !== -1 &&
                    <div className="User">
                        <p className="QuestionHeader">My Question</p>
                        {
                            <SessionQuestionsComponent
                                key={questions[userQuestionIndex].questionId}
                                question={questions[userQuestionIndex]}
                                index={userQuestionIndex}
                                isTA={this.props.isTA}
                                isMyQuestion={true}
                            />
                        }
                        <p className="Queue">Queue</p>
                    </div>
                }
                {questions && questions.length > 0 &&
                    <React.Fragment>
                        {cardList}
                    </React.Fragment>
                }
                {
                    questions && questions.length === 0 &&
                    <React.Fragment>
                        <p className="noQuestionsHeading">Queue Currently Empty</p>
                        {!this.props.isTA
                            ? <p className="noQuestionsWarning">Be the first to join the queue!</p>
                            : <p className="noQuestionsWarning">No questions in the queue yet. </p>
                        }
                    </React.Fragment>

                }

            </div>
        );
    }
}

export default SessionQuestionsContainer;
