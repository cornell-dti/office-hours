import * as React from 'react';
import SessionQuestion from './SessionQuestion';
import { Icon } from 'semantic-ui-react';
import * as moment from 'moment';

class SessionQuestionsContainer extends React.Component {
    props: {
        isTA: boolean,
        questions: AppQuestion[] | null,
        myUserId: number,
        handleJoinClick: Function,
        triggerUndo: Function,
        refetch: Function,
        isOpen: boolean,
        isPast: boolean,
        openingTime: Date,
    };

    render() {
        var questions = this.props.questions;
        var myQuestion = questions && questions.filter(q => q.userByAskerId.userId === this.props.myUserId);

        return (
            <div className="SessionQuestionsContainer splitQuestions" >
                {!this.props.isTA && myQuestion && myQuestion.length === 0 && this.props.isOpen &&
                    <div className="SessionJoinButton" onClick={() => this.props.handleJoinClick()}>
                        <p><Icon name="plus" /> Join the Queue</p>
                    </div>
                }
                {questions && questions.length > 0 && this.props.isPast &&
                    <div className="SessionClosedMessage">
                        This queue has closed and is no longer accepting new questions.
                    </div>
                }
                {questions && myQuestion && myQuestion.length > 0 &&
                    <div className="User">
                        <p className="QuestionHeader">My Question</p>
                        <SessionQuestion
                            key={myQuestion[0].questionId}
                            question={myQuestion[0]}
                            index={questions.indexOf(myQuestion[0])}
                            isTA={this.props.isTA}
                            isMyQuestion={true}
                            triggerUndo={this.props.triggerUndo}
                            refetch={this.props.refetch}
                            isPast={this.props.isPast}
                        />
                        <p className="Queue">Queue</p>
                    </div>
                }
                {questions && questions.length > 0 &&
                    questions.map((question, i: number) => (
                        <SessionQuestion
                            key={question.questionId}
                            question={question}
                            index={i}
                            isTA={this.props.isTA}
                            isMyQuestion={question.userByAskerId.userId === this.props.myUserId}
                            triggerUndo={this.props.triggerUndo}
                            refetch={this.props.refetch}
                            isPast={this.props.isPast}
                        />
                    ))
                }
                {questions && questions.length === 0 &&
                    <React.Fragment>
                        <p className="noQuestionsHeading">
                            {this.props.isOpen ? 'Queue Currently Empty' :
                                this.props.isPast ? 'Queue Has Closed' : 'Queue Not Open Yet'}
                        </p>
                        {!this.props.isOpen ?
                            (
                                this.props.isPast ?
                                    <p className="noQuestionsWarning">This office hour session has ended.</p> :
                                    <p className="noQuestionsWarning">
                                        Please check back at {moment(this.props.openingTime).format('h:mm A')}
                                        {
                                            moment().startOf('day') === moment(this.props.openingTime).startOf('day') ?
                                                '' : (' on ' + moment(this.props.openingTime).format('D MMM'))
                                        }!
                                    </p>
                            ) :
                            !this.props.isTA
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
