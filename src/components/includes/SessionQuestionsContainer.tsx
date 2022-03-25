import * as React from 'react';
import { Loader } from 'semantic-ui-react';
import moment from 'moment';
import { connect } from 'react-redux';
import SessionQuestion from './SessionQuestion';
import AddQuestion from './AddQuestion';
import DiscussionQuestion from './DiscussionQuestion';
import SortArrows from '../../media/sortbyarrows.svg';
import { RootState } from '../../redux/store';

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
    // eslint-disable-next-line react/no-unused-prop-types
    readonly handleJoinClick: Function;
    readonly triggerUndo: Function;
    readonly isOpen: boolean;
    readonly isPast: boolean;
    readonly openingTime: Date;
    readonly haveAnotherQuestion: boolean;
    readonly modality: FireSessionModality;
    // readonly user: FireUser;
    course: FireCourse;
    readonly myQuestion: FireQuestion | null;
    setShowModal: (show: boolean) => void;
    setRemoveQuestionId: (newId: string | undefined) => void;
    setShowBanner: (show: boolean) => void;
    setIsTimeWarning: (isTimeWarning: boolean) => void;
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
    setShowModal: (show: boolean) => void;
    setRemoveQuestionId: (newId: string | undefined) => void;
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
    setShowModal,
    setRemoveQuestionId
}: StudentMyQuestionProps) => {

    if (studentQuestion == null) {
        return <div />;
    }

    return (
        <div className="User">
            <p className="QuestionHeader">My Question</p>
            {modality === 'review' ? (
                <DiscussionQuestion
                    question={studentQuestion as FireDiscussionQuestion}
                    users={{}}
                    tags={tags}
                    isTA={false}
                    includeRemove={true}
                    isPast={isPast}
                // myQuestion={true}
                />
            ) : (
                <SessionQuestion
                    key={questionId}
                    question={studentQuestion}
                    modality={modality}
                    users={{}}
                    tags={tags}
                    index={index}
                    isTA={false}
                    includeRemove={true}
                    triggerUndo={triggerUndo}
                    isPast={isPast}
                    myUserId={myUserId}
                    setShowModal={setShowModal}
                    setRemoveQuestionId={setRemoveQuestionId}
                    newQuestionAssigned={() => { }}
                    clearQuestionAssigned={() => { }}
                />
            )}
        </div>
    );
};

const usePrev = <T extends unknown>(val: T): T | undefined => {
    const r = React.useRef<T>();
    React.useEffect(() => {
        r.current = val;
    });
    return r.current;
}

const SessionQuestionsContainer = (props: Props) => {
    const [filterByAnsweredQuestions, setFilterByAnsweredQuestions] = React.useState(false);
    const [sortByUpvotes, setSortByUpvotes] = React.useState(true);
    const [timeoutId, setTimeoutId] = React.useState<any>(undefined);
    const [warningTimeoutId, setWarningTimeoutId] = React.useState<any>(undefined);
    // eslint-disable-next-line
    const [audio, setAudio] = React.useState<HTMLAudioElement>(new Audio("../../../qmijinglefinal.mp3"));
    const prevQuestion = usePrev<FireQuestion | null>(props.myQuestion);

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

    // Handles student side of time limit
    React.useEffect(() => {
        if (prevQuestion && prevQuestion.status === 'assigned') {
            if (props.myQuestion === null || props.myQuestion.status === 'unresolved') {
                clearQuestionAssigned();
            }
        } else if (prevQuestion && prevQuestion.status === 'unresolved') {
            if (props.myQuestion && props.myQuestion.status === 'assigned') {
                newQuestionAssigned();
            }
        }
        // eslint-disable-next-line
    }, [props.myQuestion])


    const questionWarning = () => {
        audio.play().catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e);
        });
        props.setIsTimeWarning(true);
        props.setShowBanner(true);
    }

    const questionTimeUp = () => {
        audio.play().catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e);
        });
        props.setIsTimeWarning(false);
        props.setShowBanner(true);
    }

    const newQuestionAssigned = () => {
        if (typeof props.course.isTimeLimit === 'undefined' || !props.course.isTimeLimit ||
            typeof props.course.timeLimit === 'undefined' || typeof props.course.timeWarning === 'undefined') return;
        if (typeof timeoutId !== 'undefined') {
            clearTimeout(timeoutId);
        }
        if (typeof warningTimeoutId !== 'undefined') {
            clearTimeout(warningTimeoutId);
        }
        // Time limit is in minutes, so we convert to milliseconds by multiplying by 60k
        setTimeoutId(setTimeout(questionTimeUp, props.course.timeLimit * 60000));
        setWarningTimeoutId(setTimeout(questionWarning, (props.course.timeLimit - props.course.timeWarning) * 60000));
    }

    const clearQuestionAssigned = () => {
        if (typeof timeoutId !== 'undefined') {
            clearTimeout(timeoutId);
        }
        if (typeof warningTimeoutId !== 'undefined') {
            clearTimeout(warningTimeoutId);
        }
        setWarningTimeoutId(undefined);
        setTimeoutId(undefined);
        props.setShowBanner(false);
    }


    const compareUpvotes = (q1: FireDiscussionQuestion, q2: FireDiscussionQuestion) => {
        const upvoteDifference = q2.upvotedUsers.length - q1.upvotedUsers.length;
        if (upvoteDifference !== 0) return upvoteDifference;
        return q2.timeEntered.seconds - q1.timeEntered.seconds;
    };

    const compareTimeEntered = (q1: FireDiscussionQuestion, q2: FireDiscussionQuestion) => {
        return q2.timeEntered.seconds - q1.timeEntered.seconds;
    };

    const allQuestions = props.questions;

    const myQuestion = props.myQuestion;

    const myQuestionIndex = allQuestions.findIndex(
        question => question.questionId === myQuestion?.questionId
    );

    // Only display the top 10 questions on the queue
    const shownQuestions = allQuestions.slice(0, Math.min(allQuestions.length, NUM_QUESTIONS_SHOWN));

    const filteredQuestions = filterByAnsweredQuestions
        ? shownQuestions.filter(question => question.status === 'resolved')
        : shownQuestions.filter(question => question.status !== 'resolved');

    let filteredSortedQuestions: FireDiscussionQuestion[] = [];

    if (props.modality === 'review') {
        const filteredDiscussionQuestions = filteredQuestions.map(
            question => question as FireDiscussionQuestion
        );
        if (filteredDiscussionQuestions.length < 2) {
            filteredSortedQuestions = filteredDiscussionQuestions;
        } else {
            filteredSortedQuestions = sortByUpvotes
                ? filteredDiscussionQuestions.sort(compareUpvotes)
                : filteredDiscussionQuestions.sort(compareTimeEntered);
        }
    }

    // Make sure that the data has loaded and user has a question
    if (shownQuestions && myQuestion) {
        // Update tab with user position
        document.title = '(' + (1 + myQuestionIndex) + ') Queue Me In';
    } else if (props.isTA && shownQuestions) {
        document.title = '(' + shownQuestions.length + ') Queue Me In';
    } else {
        // Reset title and notif state
        document.title = 'Queue Me In';
    }

    // questionTimeUp();

    return (
        <div className="SessionQuestionsContainer splitQuestions">
            {!props.isTA && !myQuestion && props.isOpen && !props.haveAnotherQuestion ? (
                props.course && props.session ? (
                    <AddQuestion
                        session={props.session}
                        course={props.course}
                        mobileBreakpoint={MOBILE_BREAKPOINT}
                    />
                ) : (
                    <Loader active={true} content={'Loading'} />
                )
            ) : null}
            {!props.isTA && !myQuestion && props.isOpen && props.haveAnotherQuestion && (
                <>
                    <div className="SessionClosedMessage">
                        You are holding a spot in another active queue. To join this queue, please retract
                        your question from the other queue!
                    </div>
                    <div className="SessionJoinButton disabled">
                        <p>Join the Queue</p>
                    </div>
                </>
            )}
            {shownQuestions && shownQuestions.length > 0 && props.isPast && (
                <div className="SessionClosedMessage">
                    This queue has closed and is no longer accepting new questions.
                </div>
            )}
            {shownQuestions && myQuestion && (
                <StudentMyQuestion
                    questionId={myQuestion.questionId}
                    studentQuestion={myQuestion}
                    modality={props.modality}
                    tags={props.tags}
                    index={myQuestionIndex}
                    triggerUndo={props.triggerUndo}
                    isPast={props.isPast}
                    myUserId={props.myUserId}
                    setShowModal={props.setShowModal}
                    setRemoveQuestionId={props.setRemoveQuestionId}
                />
            )}
            {shownQuestions && shownQuestions.length > 0 && props.modality === 'review' && (
                <div className="discussionHeaderWrapper">
                    <div className="discussionQuestionsSlider">
                        <div
                            className={
                                'discussionSliderSelector' +
                                (filterByAnsweredQuestions ? ' isSlidedRight' : '')
                            }
                        />
                        <div
                            className={
                                'discussionSliderOption' + (filterByAnsweredQuestions ? '' : ' isSelected')
                            }
                            onClick={() => setFilterByAnsweredQuestions(false)}
                        >
                            Unanswered Questions
                        </div>
                        <div
                            className={
                                'discussionSliderOption' + (filterByAnsweredQuestions ? ' isSelected' : '')
                            }
                            onClick={() => setFilterByAnsweredQuestions(true)}
                        >
                            Answered Questions
                        </div>
                    </div>
                    <div className="sortDiscussionQuestionsWrapper">
                        <div className="discussionArrowsContainer">
                            <img className="sortDiscussionArrow" src={SortArrows} alt="Sort by arrows" />
                        </div>
                        <p className="sortDiscussionQuestionsLabel">sort by</p>
                        <div className="sortDiscussionQuestionsOptions">
                            <div
                                className={'sortDiscussionsSlider' + (sortByUpvotes ? '' : ' slidedRight')}
                            />
                            <div
                                className={
                                    'sortDiscussionQuestionsOption' + (sortByUpvotes ? ' optionChosen' : '')
                                }
                                onClick={() => setSortByUpvotes(true)}
                            >
                                Most Upvotes
                            </div>
                            <div
                                className={
                                    'sortDiscussionQuestionsOption' + (sortByUpvotes ? '' : ' optionChosen')
                                }
                                onClick={() => setSortByUpvotes(false)}
                            >
                                Most Recent
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {filteredSortedQuestions &&
                shownQuestions.length > 0 &&
                props.modality === 'review' &&
                filteredSortedQuestions.map(question => (
                    <DiscussionQuestion
                        key={question.questionId}
                        question={question as FireDiscussionQuestion}
                        users={props.users}
                        tags={props.tags}
                        isTA={props.isTA}
                        includeRemove={false}
                        isPast={props.isPast}
                    // myQuestion={false}
                    />
                ))}
            {shownQuestions &&
                shownQuestions.length > 0 &&
                props.modality !== 'review' &&
                props.isTA &&
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
                        setShowModal={props.setShowModal}
                        setRemoveQuestionId={props.setRemoveQuestionId}
                        newQuestionAssigned={newQuestionAssigned}
                        clearQuestionAssigned={clearQuestionAssigned}
                    />
                ))}
            {shownQuestions && shownQuestions.length === 0 && (
                <>
                    {
                        !props.isOpen &&
                        (props.isPast ? (
                            <p className="noQuestionsWarning">This office hour session has ended.</p>
                        ) : (
                            <p className="noQuestionsWarning">
                                Please check back at {moment(props.openingTime).format('h:mm A')}
                                {moment().startOf('day') === moment(props.openingTime).startOf('day')
                                    ? ''
                                    : ' on ' + moment(props.openingTime).format('MMM D')}
                                !
                            </p>
                        ))
                        // !props.isTA
                        //     ? <p className="noQuestionsWarning">Be the first to join the queue!</p>
                        //     : <p className="noQuestionsWarning">No questions in the queue yet. </p>
                    }
                </>
            )}
        </div>
    );
};

SessionQuestionsContainer.defaultProps = {
    myVirtualLocation: undefined,
};

const mapStateToProps = (state: RootState) => ({
    user: state.auth.user
})


export default connect(mapStateToProps, {})(SessionQuestionsContainer);
