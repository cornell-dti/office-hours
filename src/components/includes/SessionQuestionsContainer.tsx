import * as React from 'react';
import { useState } from 'react';
import { Loader, Icon } from 'semantic-ui-react';
import moment from 'moment';
import { connect } from 'react-redux';
import SessionQuestion from './SessionQuestion';
import AddQuestion from './AddQuestion';
import DiscussionQuestion from './DiscussionQuestion';
import SortArrows from '../../media/sortbyarrows.svg';
import { RootState } from '../../redux/store';
import { addBanner, removeBanner } from '../../redux/actions/announcements';
import Chalkboard from '../../media/chalkboard-teacher.svg';
import { getTagsQuery, useQuery } from '../../firehooks';

// Maximum number of questions to be shown to user
const NUM_QUESTIONS_SHOWN = 20;
const MOBILE_BREAKPOINT = 920;

type Props = {
    // Session used to update TAs on question answering
    readonly session: FireSession;
    readonly isTA: boolean;
    readonly isProf: boolean;
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
    readonly isPaused: boolean | undefined;
    readonly openingTime: Date;
    readonly haveAnotherQuestion: boolean;
    readonly modality: FireSessionModality;
    // readonly user: FireUser;
    course: FireCourse;
    readonly myQuestion: FireQuestion | null;
    setShowModal: (show: boolean) => void;
    setRemoveQuestionId: (newId: string | undefined) => void;
    timeWarning: number | undefined;
    addBanner: (banner: Announcement, session: boolean) => Promise<void>;
    removeBanner: (banner: string, session: boolean) => Promise<void>;
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
    readonly users: { readonly [userId: string]: FireUser };
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
    users,
    setShowModal,
    setRemoveQuestionId
}: StudentMyQuestionProps) => {

    if (studentQuestion === null) {
        return <div />;
    }

    return (
        <div className="User">
            {modality === 'review' ? (
                <DiscussionQuestion
                    question={studentQuestion as FireDiscussionQuestion}
                    users={{}}
                    commentUsers={{}}
                    tags={tags}
                    isTA={false}
                    isPast={isPast}
                // myQuestion={true}
                />
            ) : (
                <SessionQuestion
                    key={questionId}
                    question={studentQuestion}
                    modality={modality}
                    commentUsers={users}
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
    const [filteredPrimaryTags, setFilteredPrimaryTags] = useState<FireTag[]>([]);
    const [primaryTagSearch, setPrimaryTagSearch] = useState("");
    const [selectedPrimaryTag, setSelectedPrimaryTag] = useState<FireTag>();
    const [showPrimaryTagDropdown, setShowPrimaryTagDropdown] = useState(false);
    const [filteredSecondaryTags, setFilteredSecondaryTags] = useState<FireTag[]>([]);
    const [secondaryTagSearch, setSecondaryTagSearch] = useState("");
    const [selectedSecondaryTag, setSelectedSecondaryTag] = useState<FireTag>();
    const [showSecondaryTagDropdown, setShowSecondaryTagDropdown] = useState(false);
    const [showSecondaryTagSearch, setShowSecondaryTagSearch] = useState(false);
    const [sortByUpvotes, setSortByUpvotes] = React.useState(true);
    const [timeoutId, setTimeoutId] = React.useState<any>(undefined);
    const [warningTimeoutId, setWarningTimeoutId] = React.useState<any>(undefined);
    // eslint-disable-next-line
    const [audio, setAudio] = React.useState<HTMLAudioElement>(new Audio("../../../qmijinglefinal.mp3"));
    const prevQuestion = usePrev<FireQuestion | null>(props.myQuestion);

    const tags = useQuery<FireTag>(props.course.courseId, getTagsQuery, 'tagId');
    const primaryTags = tags.filter((tag) => tag.level === 1);
    const secondaryTags = tags.filter((tag) => tag.level === 2);

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

        filterTags(primaryTagSearch, primaryTags, setFilteredPrimaryTags);

        if (selectedPrimaryTag) {
            const filtered = secondaryTags.filter((tag) =>
                tag.parentTag?.startsWith(selectedPrimaryTag.tagId));
            filterTags(secondaryTagSearch, filtered, setFilteredSecondaryTags);
        }

        // eslint-disable-next-line
    }, [props.myQuestion, primaryTagSearch, secondaryTagSearch])

    const filterTags = (tagSearch: string, tags: FireTag[], 
        setFilteredTags: (value: React.SetStateAction<FireTag[]>) => void) => {
        if (tagSearch.length !== 0) {
            const filtered = tags.filter((tag) =>
                tag.name.toLowerCase().startsWith(tagSearch))
            setFilteredTags(filtered);
        } else {
            setFilteredTags(tags);
        }
    }

    const setPrimaryTag = (tag: FireTag) => {
        setSelectedPrimaryTag(tag);
        setPrimaryTagSearch(tag.name);
        setSelectedSecondaryTag(undefined);
        setSecondaryTagSearch("");
        setShowSecondaryTagSearch(false);
    }

    const setSecondaryTag = (tag: FireTag) => {
        setSelectedSecondaryTag(tag);
        setSecondaryTagSearch(tag.name);
    }

    const clearPrimaryTag = () => {
        setSelectedPrimaryTag(undefined);
        setPrimaryTagSearch("");
        setSelectedSecondaryTag(undefined);
        setSecondaryTagSearch("");
        setShowSecondaryTagSearch(false);
    }

    const clearSecondaryTag = () => {
        setSelectedSecondaryTag(undefined);
        setSecondaryTagSearch("");
        setShowSecondaryTagSearch(false);
    }

    const questionWarning = () => {
        audio.play().catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e);
        });
        const warningText =
            (typeof props.timeWarning === 'undefined') ?
                'You are almost out of time for this question' :
                `You have ${props.timeWarning} minutes remaining for this question.`
        props.addBanner({
            icon: Chalkboard,
            text: warningText
        }, true)
    }

    const questionTimeUp = () => {
        audio.play().catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e);
        });
        props.addBanner({
            icon: Chalkboard,
            text: 'Your time is up for this question!'
        }, true)
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
        const warningText =
            (typeof props.timeWarning === 'undefined') ?
                'You are almost out of time for this question' :
                `You have ${props.timeWarning} minutes remaining for this question.`
        props.removeBanner('Your time is up for this question!', true);
        props.removeBanner(warningText, true);
    }


    const compareUpvotes = (q1: FireDiscussionQuestion, q2: FireDiscussionQuestion) => {
        if(!q1 || !q1.upvotedUsers || !q2 || !q2.upvotedUsers) return 0;
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
    const shownQuestions = allQuestions.slice(0, Math.min(allQuestions.length, NUM_QUESTIONS_SHOWN))
        .filter(q => q.status !== 'resolved');

    const filteredQuestionsByAnswer = filterByAnsweredQuestions
        ? allQuestions.slice(0, Math.min(allQuestions.length, NUM_QUESTIONS_SHOWN))
            .filter(question => question.status === 'resolved')
        : allQuestions.slice(0, Math.min(allQuestions.length, NUM_QUESTIONS_SHOWN))
            .filter(question => question.status !== 'resolved');
    
    const filteredQuestionsByAnswerAndTag = selectedPrimaryTag
        ? filteredQuestionsByAnswer.slice(0, Math.min(filteredQuestionsByAnswer.length, NUM_QUESTIONS_SHOWN))
            .filter(question => question.primaryTag === selectedPrimaryTag.tagId)
        : filteredQuestionsByAnswer;

    const filteredQuestions = selectedSecondaryTag
        ? filteredQuestionsByAnswerAndTag
            .slice(0, Math.min(filteredQuestionsByAnswerAndTag.length, NUM_QUESTIONS_SHOWN))
            .filter(question => question.secondaryTag === selectedSecondaryTag.tagId)
        : filteredQuestionsByAnswerAndTag;

    const assignedQuestions = shownQuestions.filter((question) => {
        return question.status === 'assigned' && props.isTA && question.answererId === props.myUserId;
    });
    const allAssignedQuestions = shownQuestions.filter((question) => {
        return question.status === 'assigned' && question.answererId !== props.myUserId && props.isProf;
    });
    const [collapsed, setCollapsed] = useState(allAssignedQuestions.length === 0);
    const otherQuestions = filteredQuestions.filter(question => question.status !== 'assigned' &&
        !assignedQuestions.includes(question));

    let filteredSortedQuestions: FireDiscussionQuestion[] = [];

    if (props.modality === 'review') {
        const filteredDiscussionQuestions = filteredQuestions.map(
            question => question as FireDiscussionQuestion
        );
        if (filteredDiscussionQuestions && filteredDiscussionQuestions.length < 2) {
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
        <div className="SessionQuestionsWrapper">
            {shownQuestions && shownQuestions.length > 0 && props.isPast && (
                <div className="SessionClosedMessage">
                    This queue has closed and is no longer accepting new questions.
                </div>
            )}
            <div className={"SessionQuestionsContainer splitQuestions" +
                ((shownQuestions && shownQuestions.length > 0 && (props.isTA || myQuestion)) ?
                    ' whiteBackground' : '')}
            >
                {!props.isTA && !myQuestion && props.isOpen && !props.isPaused && !props.haveAnotherQuestion ? (
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
                {!props.isTA && !myQuestion && props.isOpen && !props.isPaused && props.haveAnotherQuestion && (
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
                {!props.isPast && !myQuestion && !props.isTA && props.isPaused && (
                    <div className="SessionClosedMessage">
                        This queue has been temporarily closed and is no longer accepting new questions.
                    </div>
                )}
                {shownQuestions && shownQuestions.length > 0 && !props.isTA && myQuestion &&
                    <p className="QuestionHeader">My Question</p>
                }
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
                        users={props.users}
                        setRemoveQuestionId={props.setRemoveQuestionId}
                    />
                )}
                {allQuestions && allQuestions.length > 0 && (props.modality === 'review' || props.isTA) && (
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
                        {<div className="filter-box">
                            <p className="filter-title">Selected Tags:</p>
                            <div className="filter-tag">
                                {selectedPrimaryTag ?
                                    (<div className="tag primaryTag">
                                        <p className="tag-name">{selectedPrimaryTag.name}</p>
                                        <button 
                                            type="button" 
                                            className="close primary" 
                                            onClick={() => clearPrimaryTag()}
                                        >
                                            <p>&times;</p>
                                        </button>
                                    </div>) :
                                    (<div>
                                        <p className="no-tag">No Category Selected </p>
                                    </div>)
                                }
                            </div>
                            {selectedPrimaryTag && <div className="filter-tag">
                                {selectedSecondaryTag ?
                                    (<div className="tag secondaryTag">
                                        <p className="tag-name">{selectedSecondaryTag.name}</p>
                                        <button 
                                            type="button" 
                                            className="close secondary" 
                                            onClick={() => clearSecondaryTag()}
                                        >
                                            <p>&times;</p>
                                        </button>
                                    </div>) :
                                    (<div>
                                        <p className="no-tag">No Tag Selected </p>
                                    </div>)
                                }
                            </div>}
                            <div className="dropdown-box one">
                                <p className="filter-search-title">Search for a Category</p>
                                <input
                                    type="search"
                                    placeholder={"Enter Category"}
                                    value={primaryTagSearch}
                                    onChange={(e) => setPrimaryTagSearch(e.target.value.toLowerCase())}
                                    onFocus={() => setShowPrimaryTagDropdown(true)}
                                    onBlur={() => setShowPrimaryTagDropdown(false)}
                                />
                                {showPrimaryTagDropdown && filteredPrimaryTags.length !== 0 &&
                                    (<div className="filter-results">
                                        {filteredPrimaryTags.map((tag) => (
                                            <button
                                                key={tag.tagId}
                                                type="button"
                                                className="filter-result"
                                                onMouseDown={() => setPrimaryTag(tag)}
                                            >
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>)}
                            </div>
                            {selectedPrimaryTag && !showSecondaryTagSearch && <button 
                                type="button"
                                className="filter-button"
                                onMouseDown={() => setShowSecondaryTagSearch(true)}
                            >
                                <Icon name="plus" />
                                Filter by Tag
                            </button>}
                            {showSecondaryTagSearch && <div className="dropdown-box">
                                <p className="filter-search-title">Search for a Tag</p>
                                <input
                                    type="search"
                                    placeholder={"Enter Tag"}
                                    value={secondaryTagSearch}
                                    onChange={(e) => setSecondaryTagSearch(e.target.value.toLowerCase())}
                                    onFocus={() => setShowSecondaryTagDropdown(true)}
                                    onBlur={() => setShowSecondaryTagDropdown(false)}
                                />
                                {showSecondaryTagDropdown && filteredSecondaryTags.length !== 0 &&
                                    (<div className="filter-results">
                                        {filteredSecondaryTags.map((tag) => (
                                            <button
                                                key={tag.tagId}
                                                type="button"
                                                className="filter-result"
                                                onMouseDown={() => setSecondaryTag(tag)}
                                            >
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>)}
                            </div>}
                        </div>}
                        {props.modality === 'review' && 
                            !filterByAnsweredQuestions && 
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
                            </div>}
                    </div>
                )}
                {filterByAnsweredQuestions ? (<>
                    <p />
                    {filteredQuestions.map((question, i: number) => (
                        <SessionQuestion
                            key={question.questionId}
                            modality={props.modality}
                            question={question}
                            users={props.users}
                            commentUsers={props.users}
                            tags={props.tags}
                            index={i}
                            virtualLocation={props.myVirtualLocation}
                            isTA={props.isTA}
                            includeRemove={false}
                            triggerUndo={props.triggerUndo}
                            isPast={true}
                            myUserId={props.myUserId}
                            setShowModal={props.setShowModal}
                            setRemoveQuestionId={props.setRemoveQuestionId}
                        />
                    ))}
                </>) : (<>
                    {filteredSortedQuestions &&
                    shownQuestions.length > 0 &&
                    props.modality === 'review' &&
                    filteredSortedQuestions.map(question => (
                        <DiscussionQuestion
                            key={question.questionId}
                            question={question as FireDiscussionQuestion}
                            users={props.users}
                            commentUsers={props.users}
                            tags={props.tags}
                            isTA={props.isTA}
                            isPast={props.isPast}
                            virtualLocation={props.myVirtualLocation}
                        // myQuestion={false}
                        />
                    ))}
                    {assignedQuestions && assignedQuestions.length > 0 && props.modality !== 'review' && props.isTA &&
                    <p className="QuestionHeader">Assigned Questions</p>
                    }
                    {shownQuestions &&
                    shownQuestions.length > 0 &&
                    props.modality !== 'review' &&
                    props.isTA &&
                    assignedQuestions.map((question, i: number) => (
                        <SessionQuestion
                            key={question.questionId}
                            modality={props.modality}
                            question={question}
                            users={props.users}
                            commentUsers={props.users}
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
                        />
                    ))}
                    {allAssignedQuestions && allAssignedQuestions.length > 0 && props.isProf &&
                    <>
                        <div className="allAssignedHeader">
                            <p className="QuestionHeader">All Assigned Questions</p>
                            {collapsed ?
                                <Icon name='chevron down' onClick={() => setCollapsed(false)} />
                                :
                                <Icon name='chevron up' onClick={() => setCollapsed(true)} />
                            }
                        </div>
                    </>
                    }
                    {shownQuestions &&
                    shownQuestions.length > 0 &&
                    props.modality !== 'review' &&
                    !collapsed &&
                    props.isProf &&
                    allAssignedQuestions.map((question, i: number) => (
                        <SessionQuestion
                            key={question.questionId}
                            modality={props.modality}
                            question={question}
                            users={props.users}
                            commentUsers={props.users}
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
                        />
                    ))}
                    {otherQuestions && otherQuestions.length > 0 &&
                    props.modality !== 'review' && props.isTA &&
                    <p className="QuestionHeader">Unassigned Queue Questions</p>
                    }
                    {otherQuestions &&
                    otherQuestions.length > 0 &&
                    props.modality !== 'review' &&
                    props.isTA &&
                    otherQuestions.map((question, i: number) => (
                        <SessionQuestion
                            key={question.questionId}
                            modality={props.modality}
                            question={question}
                            users={props.users}
                            commentUsers={props.users}
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
                        />
                    ))}
                </>)} 
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
        </div>

    );
};

SessionQuestionsContainer.defaultProps = {
    myVirtualLocation: undefined,
};

const mapStateToProps = (state: RootState) => ({
    user: state.auth.user
})


export default connect(mapStateToProps, { addBanner, removeBanner })(SessionQuestionsContainer);
