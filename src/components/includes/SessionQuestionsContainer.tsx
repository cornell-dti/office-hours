import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import moment from 'moment';
import SessionQuestion from './SessionQuestion';
import { firestore } from '../../firebase';

const SHOW_FEEDBACK_QUEUE = 4;
// Maximum number of questions to be shown to user
const NUM_QUESTIONS_SHOWN = 20;

type Props = {
    readonly isTA: boolean;
    // Note that these questions are sorted by time asked
    readonly questions: readonly FireQuestion[];
    readonly users: { readonly [userId: string]: FireUser };
    readonly tags: { readonly [tagId: string]: FireTag };
    readonly myUserId: string;
    readonly myVirtualLocation?: string;
    readonly handleJoinClick: Function;
    readonly triggerUndo: Function;
    readonly isOpen: boolean;
    readonly isPast: boolean;
    readonly openingTime: Date;
    readonly haveAnotherQuestion: boolean;
};

type StudentMyQuestionProps = {
    readonly questionId: string;
    readonly tags: { readonly [tagId: string]: FireTag };
    readonly index: number;
    readonly triggerUndo: Function;
    readonly isPast: boolean;
    readonly myUserId: string;
};

const StudentMyQuestion = ({ questionId, tags, index, triggerUndo, isPast, myUserId }: StudentMyQuestionProps) => {
    const [studentQuestion, setStudentQuestion] = React.useState<FireQuestion | undefined>();
    React.useEffect(
        () => {
            return firestore.collection('questions').doc(questionId).onSnapshot(snapshot => {
                setStudentQuestion({ ...snapshot.data(), questionId: snapshot.id } as FireQuestion);
            }, () => {
                // Do nothing when there is an error.

                // Note: there is a race condition going on when adding question happened.
                // 1. Adding question writes to two collections: questionSlots and questions.
                // 2. Firebase is smart enough to detect that adding those document will eventually
                //    succeed, so it adds the document to the local database and triggers a new
                //    onSnapshot with the new questionSlot data.
                // 3. This hook is trying the full question from the remote. By the time the local
                //    snapshot is updated, the remote data might not been written yet, so it will
                //    fail with an error.
                // 4. This error will eventually go away, since the full question data will eventually
                //    be written.
            });
        },
        [questionId]
    );
    if (studentQuestion == null) {
        return <div />;
    }

    return (
        <div className="User">
            <p className="QuestionHeader">My Question</p>
            <SessionQuestion
                key={questionId}
                question={studentQuestion}
                users={{}}
                tags={tags}
                index={index}
                isTA={false}
                includeRemove={true}
                triggerUndo={triggerUndo}
                isPast={isPast}
                myUserId={myUserId}
            />
        </div>
    );
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

    const allQuestions = props.questions;

    // If the user has questions, store them in myQuestion[]
    const myQuestion = allQuestions && allQuestions.filter(q => q.askerId === props.myUserId);

    // Only display the top 10 questions on the queue
    const shownQuestions = allQuestions.slice(0, Math.min(allQuestions.length, NUM_QUESTIONS_SHOWN));
    // Make sure that the data has loaded and user has a question
    if (shownQuestions && myQuestion && myQuestion.length > 0) {
        // Get user's position in queue (0 indexed)
        const myQuestionIndex = allQuestions.indexOf(myQuestion[0]);
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
    } else if (props.isTA && shownQuestions) {
        document.title = '(' + shownQuestions.length + ') Queue Me In';
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
                        props.handleJoinClick(shownQuestions && myQuestion
                            && allQuestions.indexOf(myQuestion[0]) > SHOW_FEEDBACK_QUEUE)}
                >
                    <p><Icon name="plus" /> Join the Queue</p>
                </div>
            }
            {!props.isTA && myQuestion && myQuestion.length === 0 && props.isOpen
                && props.haveAnotherQuestion &&
                <>
                    <div className="SessionClosedMessage">
                        You are holding a spot in another active queue.
                        To join this queue, please retract your question from the other queue!
                    </div>
                    <div className="SessionJoinButton disabled">
                        <p><Icon name="plus" /> Join the Queue</p>
                    </div>
                </>
            }
            {shownQuestions && shownQuestions.length > 0 && props.isPast &&
                <div className="SessionClosedMessage">
                    This queue has closed and is no longer accepting new questions.
                </div>
            }
            {shownQuestions && myQuestion && myQuestion.length > 0 &&
                <StudentMyQuestion
                    questionId={myQuestion[0].questionId}
                    tags={props.tags}
                    index={allQuestions.indexOf(myQuestion[0])}
                    triggerUndo={props.triggerUndo}
                    isPast={props.isPast}
                    myUserId={props.myUserId}
                />
            }
            {shownQuestions && shownQuestions.length > 0 && props.isTA &&
                shownQuestions.map((question, i: number) => (
                    <SessionQuestion
                        key={question.questionId}
                        question={question}
                        users={props.users}
                        tags={props.tags}
                        index={i}
                        virtualLocation={props.myVirtualLocation}
                        isTA={props.isTA}
                        includeRemove={false}
                        triggerUndo={props.triggerUndo}
                        isPast={props.isPast}
                        myUserId={props.myUserId}
                    />
                ))
            }
            {shownQuestions && shownQuestions.length === 0 &&
                <>
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
                </>
            }
        </div>
    );
};

export default SessionQuestionsContainer;
