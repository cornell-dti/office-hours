import * as React from 'react';
import SessionQuestion from './SessionQuestion';
import { Icon } from 'semantic-ui-react';
import moment from 'moment';

const SHOW_FEEDBACK_QUEUE = 4;

type Props = {
    readonly isTA: boolean;
    readonly questions: readonly FireQuestion[];
    readonly tags: { readonly [tagId: string]: FireTag };
    readonly myUserId: string;
    readonly handleJoinClick: Function;
    readonly triggerUndo: Function;
    readonly isOpen: boolean;
    readonly isPast: boolean;
    readonly openingTime: Date;
    readonly haveAnotherQuestion: boolean;
};

const SessionQuestionsContainer = (props: Props) => {
    const [sentNotification, setSentNotification] = React.useState(
        window.localStorage.getItem('questionUpNotif') === 'sent' || false
    );

    React.useEffect(() => {
        try {
            // Request permission to send desktop notifications
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        } catch (error) {
            // Do nothing. iOS crashes because Notification isn't defined
        }
    }, []);

    const questions = props.questions;
    // If the user has questions, store them in myQuestion[]
    const myQuestion = questions && questions.filter(q => q.askerId === props.myUserId);
    // Make sure that the data has loaded and user has a question
    if (questions && myQuestion && myQuestion.length > 0) {
        // Get user's position in queue (0 indexed)
        const myQuestionIndex = questions.indexOf(myQuestion[0]);
        // Update tab with user position
        document.title = '(' + (1 + myQuestionIndex) + ') Queue Me In';
        // if user is up and we haven't already sent a notification, send one.
        if (myQuestionIndex === 0 && !sentNotification) {
            window.localStorage.setItem('questionUpNotif', 'sent');
            setSentNotification(true);
            try {
                const n = new Notification('Your question is up!');
                setTimeout(n.close.bind(n), 4000);
            } catch (error) {
                // Do nothing. iOS crashes because Notification isn't defined
            }
            // If next render, the user isn't at 0 anymore, reset state
        } else if (myQuestionIndex !== 0 && sentNotification) {
            window.localStorage.setItem('questionUpNotif', '');
            setSentNotification(false);
        }
    } else if (props.isTA && questions) {
        document.title = '(' + questions.length + ') Queue Me In';
    } else {
        // Reset title and notif state
        document.title = 'Queue Me In';
        if (sentNotification) {
            setSentNotification(false);
        }
    }

    return (
        <div className="SessionQuestionsContainer splitQuestions" >
            {!props.isTA && myQuestion && myQuestion.length === 0 && props.isOpen
                && !props.haveAnotherQuestion &&
                <div
                    className="SessionJoinButton"
                    onClick={() =>
                        props.handleJoinClick(questions && myQuestion
                            && questions.indexOf(myQuestion[0]) > SHOW_FEEDBACK_QUEUE)}
                >
                    <p><Icon name="plus" /> Join the Queue</p>
                </div>
            }
            {!props.isTA && myQuestion && myQuestion.length === 0 && props.isOpen
                && props.haveAnotherQuestion &&
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
            {questions && questions.length > 0 && props.isPast &&
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
                        tags={props.tags}
                        index={questions.indexOf(myQuestion[0])}
                        isTA={props.isTA}
                        includeRemove={true}
                        triggerUndo={props.triggerUndo}
                        isPast={props.isPast}
                        myUserId={props.myUserId}
                    />
                    <p className="Queue">Queue</p>
                </div>
            }
            {questions && questions.length > 0 &&
                questions.map((question, i: number) => (
                    <SessionQuestion
                        key={question.questionId}
                        question={question}
                        tags={props.tags}
                        index={i}
                        isTA={props.isTA}
                        includeRemove={false}
                        triggerUndo={props.triggerUndo}
                        isPast={props.isPast}
                        myUserId={props.myUserId}
                    />
                ))
            }
            {questions && questions.length === 0 &&
                <React.Fragment>
                    <p className="noQuestionsHeading">
                        {props.isOpen ? 'Queue Currently Empty' :
                            props.isPast ? 'Queue Has Closed' : 'Queue Not Open Yet'}
                    </p>
                    {!props.isOpen ?
                        (
                            props.isPast ?
                                <p className="noQuestionsWarning">This office hour session has ended.</p> :
                                <p className="noQuestionsWarning">
                                    Please check back at {moment(props.openingTime).format('h:mm A')}
                                    {
                                        moment().startOf('day') === moment(props.openingTime).startOf('day') ?
                                            '' : (' on ' + moment(props.openingTime).format('MMM D'))
                                    }!
                                </p>
                        ) :
                        !props.isTA
                            ? <p className="noQuestionsWarning">Be the first to join the queue!</p>
                            : <p className="noQuestionsWarning">No questions in the queue yet. </p>
                    }
                </React.Fragment>
            }
        </div>
    );
};

export default SessionQuestionsContainer;
