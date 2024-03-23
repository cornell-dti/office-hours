import React, { useState } from 'react';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import GreenCheck from '../../media/greenCheck.svg';
import CommentBubble from '../../media/chat_bubble.svg';
// eslint-disable-next-line 
// @ts-ignore (Linkify has no typescript)
import { firestore } from '../../firebase';
import SelectedTags from './SelectedTags';
import Arrow from '../../media/arrow_discussion.svg';
import ArrowOrange from '../../media/arrow_discussion_orange.svg';
import ResolvedIcon from '../../media/resolvedcheck.svg';
import notif from '../../media/notif.svg'
import {
    markStudentNoShow,
    assignQuestionToTA,
    markQuestionDone,
    markQuestionDontKnow,
    addComment,
    deleteComment,
    clearIndicator
} from '../../firebasefunctions/sessionQuestion';
import { RootState } from '../../redux/store';
import CommentsContainer from './CommentsContainer';

type Props = {
    question: FireDiscussionQuestion;
    readonly user: FireUser;
    users: { readonly [userId: string]: FireUser };
    commentUsers: { readonly [userId: string]: FireUser };
    tags: { readonly [tagId: string]: FireTag };
    isTA: boolean;
    isPast: boolean;
    virtualLocation?: string;
    // myQuestion: boolean;
};

const DiscussionQuestion = (props: Props) => {
    const question = props.question;
    const primaryTag = question.primaryTag ? props.tags[question.primaryTag] : undefined;
    const secondaryTag = question.secondaryTag ? props.tags[question.secondaryTag] : undefined;
    const user = props.user;

    const [showDiscComment, setShowDiscComment] = useState(false);

    const upvoteQuestion = () => {
        if (props.isPast) {
            return;
        }
        const batch = firestore.batch();
        const upvotedUsers = question.upvotedUsers;
        const userIndex = upvotedUsers ? upvotedUsers.findIndex(userId => userId === props.user.userId) : -1;
        if (userIndex !== -1) {
            upvotedUsers.splice(userIndex, 1);
        } else {
            upvotedUsers.push(props.user.userId);
        }
        const update = { upvotedUsers };
        batch.update(firestore.doc(`questions/${question.questionId}`), update);
        batch.commit();
    };

    const deleteCommentsHelper = (commentId: string, questionId: string) => {
        deleteComment(commentId, questionId);
    }

    const addCommentsHelper = (content: string) => {
        addComment(content, props.user.userId, props.question.questionId,
            props.isTA, props.question.askerId, props.question.answererId);
    }

    const switchCommentsVisible = () => {
        setShowDiscComment(!showDiscComment);
    }

    const assignQuestion = () => {
        if (props.isPast) return;
        assignQuestionToTA(firestore, props.question, props.virtualLocation, props.user.userId);
    };

    const [showNoShowPopup, setShowNoShowPopup] = useState(false);
    const [showUndoPopup, setShowUndoPopup] = useState(false);
    const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout>(setTimeout(() => {}, 0));
    const [timeoutID2, setTimeoutID2] = useState<NodeJS.Timeout>(setTimeout(() => {}, 0));

    const studentNoShow = () => {
        setShowNoShowPopup(true);

        const id = setTimeout(() => {
            setShowNoShowPopup(false);
            markStudentNoShow(firestore, props.question);
        }, 3000);

        setTimeoutID2(id);

    };

    const questionDone = () => {
        setShowUndoPopup(true);

        const id = setTimeout(() => {
            setShowUndoPopup(false);
            markQuestionDone(firestore, props.question);
        }, 3000);

        setTimeoutID(id);

    };

    const undoDone = () => {
        clearTimeout(timeoutID);
        setShowUndoPopup(false);
        setTimeoutID(setTimeout(() => {}, 0));
        questionDontKnow();
    }

    const undoNoShow = () => {
        clearTimeout(timeoutID2);
        setShowNoShowPopup(false);
        setTimeoutID2(setTimeout(() => {}, 0));
        questionDontKnow();
    }

    const questionDontKnow = () => {
        markQuestionDontKnow(firestore, props.question);
    };

    const handleReplyButton = () => {
        clearIndicator(props.question, props.isTA);
        if (props.isPast) return;
        if (showDiscComment) {
            setShowDiscComment(false);
        } else {
            setShowDiscComment(true);
        }
    }

    const student = props.users[question.askerId];

    return (
        <div className="discussionQuestion">
            <div className="discussionContainer">
                {question.status === 'resolved' && (
                    <div className="resolvedDiscussionBadge">
                        <p className="resolvedDiscussionText">Resolved</p>
                        <img className="resolvedCheckImage" alt="Resolved check" src={ResolvedIcon} />
                    </div>
                )}
                <div className="discussionHeaderWrapper">
                    <div className="upvoteAndUserInfoContainer">
                        <div className="upvoteContainer">
                            <button
                                className="upvoteButton"
                                type="button"
                                aria-label="upvote"
                                onClick={upvoteQuestion}
                            >
                                <img 
                                    className="upvoteArrow" 
                                    src={props.question.upvotedUsers && 
                                      props.question.upvotedUsers.findIndex(
                                          userId => userId === props.user.userId
                                      ) !== -1 
                                        ? ArrowOrange 
                                        : Arrow} 
                                    alt="Upvote arrow" 
                                />
                            </button>
                            <div className="upvoteCount">
                                {question.upvotedUsers ? question.upvotedUsers.length : 0}
                            </div>
                        </div>
                        {!props.isTA && (
                            <div className="discussionQuestionBody isStudentUserDiscussion">
                                <div className="discussionQuestionContent">{question.content}</div>
                            </div>
                        )}
                        {props.isTA && student && (
                            <div className="userPhotoAndNameWrapper">
                                <img
                                    src={student.photoUrl ? student.photoUrl : '/placeholder.png'}
                                    className="discussionProfileImage"
                                    alt="Student profile"
                                />
                                <p className="discussionProfileUserName">
                                    {student.firstName + ' ' + student.lastName}
                                </p>
                            </div>
                        )}
                    </div>
                    {question.timeEntered != null &&
                                <p className="Time">
                                    {<Moment date={question.timeEntered.toDate()} interval={0} format={'hh:mm A'} />}
                                </p>}
                </div>
                <div className="lowerDiscussionContainer">
                    <div className="questionAndTagsWrapper">
                        {props.isTA && (
                            <div className="discussionQuestionBody isTAUserDiscussion">
                                <div className="discussionQuestionContent">{question.content}</div>
                            </div>
                        )}
                        <div className="tagsContainer">
                            <div className="discussionTags">
                                {primaryTag && (
                                    <SelectedTags tag={primaryTag} isSelected={false} isDiscussion={true} />
                                )}
                                {secondaryTag && (
                                    <SelectedTags tag={secondaryTag} isSelected={false} isDiscussion={true} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {
                    props.isTA &&
                        <div className="Buttons">
                            <hr />
                            <div className="buttonsWrapper">
                                <div className="replyButton">
                                    {!showDiscComment && question.taNew && <img
                                        className="indicator"
                                        src={notif}
                                        alt="Notification indicator"
                                    />}
                                    <img
                                        className="replyIcon"
                                        src={CommentBubble}
                                        alt="Reply icon"
                                        onClick={handleReplyButton}
                                    />
                                </div>
                                <div className="TAButtons">
                                    {question.status === 'unresolved' ?
                                        <p className="Begin" onClick={assignQuestion}>
                                            Assign to me
                                        </p>
                                        :
                                        <p className="Begin" onClick={questionDontKnow}>
                                            Unassign from me
                                        </p>
                                    }
                                </div>
                                <div className="assignedButtons">
                                    {question.status === 'assigned' &&
                                        <>
                                            <button
                                                className="Delete"
                                                onClick={studentNoShow}
                                                type="button"
                                            >No show</button>
                                            <button
                                                className="Done"
                                                onClick={questionDone}
                                                type="button"
                                            >Done</button>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                }
                {
                    showDiscComment ?
                        < CommentsContainer
                            users={props.commentUsers}
                            currentUser={user}
                            addCommentsHelper={addCommentsHelper}
                            questionId={question.questionId}
                            switchCommentsVisible={switchCommentsVisible}
                            deleteCommentsHelper={deleteCommentsHelper}
                            showNewComment={true}
                            isPast={props.isPast}
                        /> :
                        <></>
                }
                {showNoShowPopup && (
                    <div className="popup">
                        <div className="popupContainer">
                            <div className="resolvedQuestionBadge">
                                <img
                                    className="resolvedCheckImage"
                                    alt="Green check"
                                    src={GreenCheck}
                                />
                                <p className="resolvedQuestionText">
                                        Student Marked as No Show
                                </p>
                            </div>
                        </div>
                        <p className="Undo" onClick={undoNoShow}>
                                Undo
                        </p>
                    </div>
                )}
                {showUndoPopup && (
                    <div className="popup">
                        <div className="popupContainer">
                            <div className="resolvedQuestionBadge">
                                <img
                                    className="resolvedCheckImage"
                                    alt="Green check"
                                    src={GreenCheck}
                                />
                                <p className="resolvedQuestionText">
                                        Question Marked as Done
                                </p>
                            </div>
                        </div>
                        <p className="Undo" onClick={undoDone}>
                                Undo
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};


DiscussionQuestion.defaultProps = {
    virtualLocation: undefined
};

const mapStateToProps = (state: RootState) => ({
    user : state.auth.user
})


export default connect(mapStateToProps, {})(DiscussionQuestion);
