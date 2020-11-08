import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import moment from 'moment';
import addNotification from 'react-push-notification';
import SessionQuestion from './SessionQuestion';
import { useAskerQuestions } from '../../firehooks';
import AddQuestion from '../includes/AddQuestion';
import { Loader } from 'semantic-ui-react';

const SHOW_FEEDBACK_QUEUE = 4;
// Maximum number of questions to be shown to user
const NUM_QUESTIONS_SHOWN = 20;
const MOBILE_BREAKPOINT = 920;

type Props = {
    // Session used to update TAs on question answering
    readonly session: FireSession;
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
    readonly modality: FireSessionModality;
    readonly user: FireUser;
    course: FireCourse;
};

type StudentMyQuestionProps = {
    readonly questionId: string;
    readonly tags: { readonly [tagId: string]: FireTag };
    readonly index: number;
    readonly triggerUndo: Function;
    readonly isPast: boolean;
    readonly myUserId: string;
    readonly modality: FireSessionModality;
    readonly studentQuestion: FireQuestion | null;
    readonly user: FireUser;
};

const StudentMyQuestion = ({
    questionId,
    tags,
    index,
    triggerUndo,
    isPast,
    myUserId,
    modality,
    studentQuestion,
    user
}: StudentMyQuestionProps) => {
    if (studentQuestion == null) {
        return <div />;
    }

    return (
        <div className="User">
            <p className="QuestionHeader">My Question</p>
            <SessionQuestion
                key={questionId}
                question={studentQuestion}
                modality={modality}
                users={{}}
                user={user}
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
    const myUserId = props.myUserId;
    const sessionId = props.session.sessionId;

    const myQuestions = useAskerQuestions(sessionId, myUserId);

    // If the user has questions, store them in myQuestion[]
    const myQuestion = React.useMemo(() => {
        if (myQuestions && myQuestions.length > 0) {
            return myQuestions
                .sort((a, b) => a.timeEntered.seconds - b.timeEntered.seconds)
                .find(q => q.status === 'unresolved' || q.status === 'assigned') || null;
        }

        return null;
    }, [myQuestions]);

    const myQuestionIndex = allQuestions.findIndex(question => question.questionId === myQuestion?.questionId)   

    // Only display the top 10 questions on the queue
    const shownQuestions = allQuestions.slice(0, Math.min(allQuestions.length, NUM_QUESTIONS_SHOWN));

    // Make sure that the data has loaded and user has a question
    if (shownQuestions && myQuestion) {
        // Get user's position in queue (0 indexed)
        const myQuestionIndex = allQuestions.findIndex(elt => elt.questionId === myQuestion.questionId);
        // Update tab with user position
        document.title = '(' + (1 + myQuestionIndex) + ') Queue Me In';
        // if user is up and we haven't already sent a notification, send one.
        if (myQuestionIndex === 0 && !sentNotification) {
            window.localStorage.setItem('questionUpNotif', 'sent');
            setSentNotification(true);
            try {
                addNotification({
                    title: 'Your question is up!',
                    native: true
                });
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
            {!props.isTA && !myQuestion && props.isOpen
                && !props.haveAnotherQuestion
                ? (props.course && props.session ? <AddQuestion session={props.session} course={props.course} mobileBreakpoint={MOBILE_BREAKPOINT} />
                : <Loader active={true} content={'Loading'} />)
                : null
            }
            {!props.isTA && !myQuestion && props.isOpen
                && props.haveAnotherQuestion &&
                <>
                    <div className="SessionClosedMessage">
                        You are holding a spot in another active queue.
                        To join this queue, please retract your question from the other queue!
                    </div>
                    <div className="SessionJoinButton disabled">
                        <p>Join the Queue</p>
                    </div>
                </>
            }
            {shownQuestions && shownQuestions.length > 0 && props.isPast &&
                <div className="SessionClosedMessage">
                    This queue has closed and is no longer accepting new questions.
                </div>
            }
            {shownQuestions && myQuestion &&
                <StudentMyQuestion
                    user={props.user}
                    questionId={myQuestion.questionId}
                    studentQuestion={myQuestion}
                    modality={props.modality}
                    tags={props.tags}
                    index={myQuestionIndex}
                    triggerUndo={props.triggerUndo}
                    isPast={props.isPast}
                    myUserId={props.myUserId}
                />
            }
            {shownQuestions && shownQuestions.length > 0 && props.isTA &&
                shownQuestions.map((question, i: number) => (
                    <SessionQuestion
                        key={question.questionId}
                        modality={props.modality}
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
                        user={props.user}
                    />
                ))
            }
            {shownQuestions && shownQuestions.length === 0 &&
                <>
                    {!props.isOpen &&
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
                        ) 
                        // !props.isTA
                        //     ? <p className="noQuestionsWarning">Be the first to join the queue!</p>
                        //     : <p className="noQuestionsWarning">No questions in the queue yet. </p>
                    }
                </>
            }
        </div>
    );
};

export default SessionQuestionsContainer;
