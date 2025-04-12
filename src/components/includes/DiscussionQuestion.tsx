import React, { useState } from 'react';
import Moment from 'react-moment';
import { Icon } from 'semantic-ui-react';
// eslint-disable-next-line 
// @ts-ignore (Linkify has no typescript)
import Linkify from 'linkifyjs/react';
import { connect } from 'react-redux';
import { doc, updateDoc, writeBatch} from 'firebase/firestore';
import { firestore } from '../../firebase';
import SelectedTags from './SelectedTags';
import Arrow from '../../media/arrow_discussion.svg';
import CommentImage from '../../media/comment_discussion.svg';
import ResolvedIcon from '../../media/resolvedcheck.svg';
import { markQuestionDone } from '../../firebasefunctions/sessionQuestion';
import { RootState } from '../../redux/store';

type Props = {
    question: FireDiscussionQuestion;
    readonly user: FireUser;
    users: { readonly [userId: string]: FireUser };
    tags: { readonly [tagId: string]: FireTag };
    isTA: boolean;
    includeRemove: boolean;
    isPast: boolean;
    // myQuestion: boolean;
};

const DiscussionQuestion = (props: Props) => {
    const question = props.question;
    const primaryTag = question.primaryTag ? props.tags[question.primaryTag] : undefined;
    const secondaryTag = question.secondaryTag ? props.tags[question.secondaryTag] : undefined;
    const comment = props.isTA ? question.taComment : question.studentComment;
    const studentCSS = props.isTA ? '' : ' Student';
    const user = props.user;

    const [showDiscComment, setShowDiscComment] = useState(false);

    const retractQuestion = (): void => {
        const batch = writeBatch(firestore);
        const slotUpdate: Partial<FireQuestionSlot> = { status: 'retracted' };
        const questionUpdate: Partial<FireQuestion> = slotUpdate;
        batch.update(doc(firestore, 'questionSlots', question.questionId), slotUpdate);
        batch.update(doc(firestore, 'questions', question.questionId), questionUpdate);
        batch.commit();
    };

    const upvoteQuestion = () => {
        if (props.isPast) {
            return;
        }
        const batch = writeBatch(firestore);
        const upvotedUsers = question.upvotedUsers;
        const userIndex = upvotedUsers ? upvotedUsers.findIndex(userId => userId === props.user.userId) : -1;
        if (userIndex !== -1) {
            upvotedUsers.splice(userIndex, 1);
        } else {
            upvotedUsers.push(props.user.userId);
        }
        const update = { upvotedUsers };
        batch.update(doc(firestore, 'questions', question.questionId), update);
        batch.commit();
    };

    const questionComment = (newComment: string) => {
        let update: Partial<FireDiscussionQuestion>;
        if (props.isTA) {
            update = { taComment: newComment };
        } else {
            update = { studentComment: newComment };
        }
        updateDoc(doc(firestore, 'questions', question.questionId), update).catch(() => { });
    };

    const resolveQuestion = () => {
        markQuestionDone(firestore, props.question);
    };

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
                                <img className="upvoteArrow" src={Arrow} alt="Upvote arrow" />
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
                    <button
                        className="discussionCommentButton"
                        onClick={() => setShowDiscComment(!showDiscComment)}
                        type="button"
                    >
                        <img
                            src={CommentImage}
                            className="discussionCommentImage"
                            alt="Discussion comment button"
                        />
                    </button>
                </div>
                {(question.studentComment || question.taComment) && (
                    <CommentBox
                        studentComment={question.studentComment}
                        taComment={question.taComment}
                        studentCSS={studentCSS}
                    />
                )}
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
                    <p className="discussionQuestionTime">
                        {<Moment date={question.timeEntered.toDate()} interval={0} format={'hh:mm A'} />}
                    </p>
                </div>
                {showDiscComment && (user.userId === props.question.askerId || props.isTA) && !props.isPast && (
                    <div className="CommentBox">
                        <div className="commentTopBar">
                            <img
                                className="userInformationImg"
                                src={user.photoUrl || '/placeholder.png'}
                                alt={user ? `${user.firstName} ${user.lastName}` : 'not logged-in user'}
                            />
                            <span className="userInformationName">
                                {user.firstName} {user.lastName}
                            </span>
                        </div>
                        <EditComment
                            initComment={comment || ''}
                            onValueChange={(newComment: string) => {
                                questionComment(newComment);
                                setShowDiscComment(false);
                            }}
                            onCancel={() => {
                                setShowDiscComment(false);
                            }}
                        />
                    </div>
                )}
                {props.includeRemove && !props.isPast && (
                    <div className="discussionButtons">
                        <hr className="discussionDivider" />
                        <div className="discussionRemoveButtonWrapper">
                            <button
                                className="discussionRemoveButton"
                                onClick={retractQuestion}
                                type="button"
                            >
                                <Icon className="discussionRemoveIcon" name="close" />
                                Remove
                            </button>
                        </div>
                    </div>
                )}
                {!props.isPast && props.isTA && question.status !== 'resolved' && (
                    <div className="discussionTAActionsWrapper">
                        <hr className="discussionDivider" />
                        <button className="discussionDoneButton" onClick={resolveQuestion} type="button">
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

type EditCommentProps = {
    readonly initComment: string;
    readonly onValueChange: (newComment: string) => void;
    readonly onCancel: () => void;
};

const EditComment = (props: EditCommentProps) => {
    const [editable, setEditable] = useState(false);
    const [comment, setComment] = useState(props.initComment);
    const [prevComment, setPrevComment] = useState(comment);

    if (editable) {
        return (
            <div className="commentBody">
                <textarea
                    placeholder="Add a comment..."
                    className="commentTextArea"
                    onChange={evt => {
                        setComment(evt.target.value);
                    }}
                    value={comment}
                />
                <div className="commentBtnHolder">
                    <button
                        type="button"
                        className="commentSaveBtn"
                        onClick={() => {
                            props.onValueChange(comment);
                            setPrevComment(comment);
                            setEditable(false);
                        }}
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        className="commentCancelBtn"
                        onClick={() => {
                            props.onCancel();
                            setComment(prevComment);
                            setEditable(false);
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="commentBody">
            <Linkify tagName="p">{comment || 'Add a comment...'}</Linkify>
            <button
                type="button"
                className="link-button commentEdit"
                onClick={() => {
                    setPrevComment(comment);
                    setEditable(true);
                }}
            >
                edit
            </button>
        </div>
    );
};

type CommentBoxProps = {
    readonly studentComment?: string;
    readonly taComment?: string;
    readonly studentCSS?: string;
};

const CommentBox = (props: CommentBoxProps) => {
    return (
        <div className="CommentBox">
            {props.studentComment && (
                <Linkify className={`Question ${props.studentCSS || ''}`} tagName="p">
                    Student Comment: {props.studentComment}
                </Linkify>
            )}
            {props.taComment && (
                <Linkify className={`Question ${props.studentCSS || ''}`} tagName="p">
                    TA Comment: {props.taComment}
                </Linkify>
            )}
        </div>
    );
};

CommentBox.defaultProps = {
    studentComment: undefined,
    taComment: undefined,
    studentCSS: undefined,
};
const mapStateToProps = (state: RootState) => ({
    user : state.auth.user
})


export default connect(mapStateToProps, {})(DiscussionQuestion);
