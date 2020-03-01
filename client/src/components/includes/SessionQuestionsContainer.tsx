import * as React from 'react';
import SessionQuestion from './SessionQuestion';
import { Icon } from 'semantic-ui-react';
import moment from 'moment';

const SHOW_FEEDBACK_QUEUE = 4;

class SessionQuestionsContainer extends React.Component {
    props!: {
        isTA: boolean;
        questions: FireQuestion[];
        myUserId: string;
        handleJoinClick: Function;
        triggerUndo: Function;
        isOpen: boolean;
        isPast: boolean;
        openingTime: Date;
        haveAnotherQuestion: boolean;
    };

    state!: {
        sentNotification: boolean;
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            sentNotification: window.localStorage.getItem('questionUpNotif') === 'sent' || false,
        };
    }

    componentDidMount() {
        try {
            // Request permission to send desktop notifications
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        } catch (error) {
            // Do nothing. iOS crashes because Notification isn't defined
        }
    }

    render() {
        const questions = this.props.questions;
        // If the user has questions, store them in myQuestion[]
        const myQuestion = questions && questions.filter(q => q.askerId === this.props.myUserId);
        // Make sure that the data has loaded and user has a question
        if (questions && myQuestion && myQuestion.length > 0) {
            // Get user's position in queue (0 indexed)
            const myQuestionIndex = questions.indexOf(myQuestion[0]);
            // Update tab with user position
            document.title = '(' + (1 + myQuestionIndex) + ') Queue Me In';
            // if user is up and we haven't already sent a notification, send one.
            if (myQuestionIndex === 0 && !this.state.sentNotification) {
                window.localStorage.setItem('questionUpNotif', 'sent');
                this.setState({ sentNotification: true });
                try {
                    const n = new Notification('Your question is up!');
                    setTimeout(n.close.bind(n), 4000);
                } catch (error) {
                    // Do nothing. iOS crashes because Notification isn't defined
                }
                // If next render, the user isn't at 0 anymore, reset state
            } else if (myQuestionIndex !== 0 && this.state.sentNotification) {
                window.localStorage.setItem('questionUpNotif', '');
                this.setState({ sentNotification: false });
            }
        } else if (this.props.isTA && questions) {
            document.title = '(' + questions.length + ') Queue Me In';
        } else {
            // Reset title and notif state
            document.title = 'Queue Me In';
            if (this.state.sentNotification) {
                this.setState({ sentNotification: false });
            }
        }

        return (
            <div className="SessionQuestionsContainer splitQuestions" >
                {!this.props.isTA && myQuestion && myQuestion.length === 0 && this.props.isOpen
                    && !this.props.haveAnotherQuestion &&
                    <div
                        className="SessionJoinButton"
                        onClick={() =>
                            this.props.handleJoinClick(questions && myQuestion
                                && questions.indexOf(myQuestion[0]) > SHOW_FEEDBACK_QUEUE)}
                    >
                        <p><Icon name="plus" /> Join the Queue</p>
                    </div>
                }
                {!this.props.isTA && myQuestion && myQuestion.length === 0 && this.props.isOpen
                    && this.props.haveAnotherQuestion &&
                    <React.Fragment>
                        <div className="SessionClosedMessage">
                            You are holding a spot in another active queue.
                            To join this queue, please retract your question from the other queue!
                        </div>
                        <div className="SessionJoinButton disabled">
                            <p><Icon name="plus" /> Join the Queue</p>
                        </div>
                    </React.Fragment>
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
                            includeRemove={true}
                            triggerUndo={this.props.triggerUndo}
                            isPast={this.props.isPast}
                            myUserId={this.props.myUserId}
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
                            includeRemove={false}
                            triggerUndo={this.props.triggerUndo}
                            isPast={this.props.isPast}
                            myUserId={this.props.myUserId}
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
                                                '' : (' on ' + moment(this.props.openingTime).format('MMM D'))
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
