import React, {useState} from 'react';
import Moment from 'react-moment';
import { Icon } from 'semantic-ui-react';
// @ts-ignore (Linkify has no typescript)
import Linkify from 'linkifyjs/react';
import { firestore } from '../../firebase';
import SelectedTags from './SelectedTags';


type Props = {
    question: FireDiscussionQuestion;
    readonly user: FireUser;
    tags: { readonly [tagId: string]: FireTag };
    isTA: boolean;
    includeRemove: boolean;
    isPast: boolean;
    myQuestion: boolean;
}

const DiscussionQuestion = (props: Props) => {
    const question = props.question
    const primaryTag = question.primaryTag
        ? props.tags[question.primaryTag] : undefined;
    const secondaryTag = question.secondaryTag 
        ? props.tags[question.secondaryTag] : undefined;
    const comment = props.isTA ? question.taComment : question.studentComment;
    const studentCSS = props.isTA ? '' : ' Student';
    const user = props.user;

    const [showCommentBox, setShowCommentBox] = useState(false);

    // const assignQuestion = () => {
    //     const batch = firestore.batch();
    //     const slotUpdate: Partial<FireQuestionSlot> = { status: 'assigned' };
    //     const questionUpdate: Partial<FireDiscussionQuestion> = {
    //         status: 'assigned',
    //         answererId: props.user.userId
    //     };
    //     batch.update(firestore.doc(`questionSlots/${props.question.questionId}`), slotUpdate);
    //     batch.update(firestore.doc(`questions/${props.question.questionId}`), questionUpdate);
    //     batch.commit();
    // };

    const retractQuestion = (): void => {
        const batch = firestore.batch();
        const slotUpdate: Partial<FireQuestionSlot> = { status: 'retracted' };
        const questionUpdate: Partial<FireQuestion> = slotUpdate;
        batch.update(firestore.doc(`questionSlots/${question.questionId}`), slotUpdate);
        batch.update(firestore.doc(`questions/${question.questionId}`), questionUpdate);
        batch.commit();
    };

    const upvoteQuestion = () => {
        if (props.isPast) {
            return
        }
        const batch = firestore.batch();
        const upvotedUsers = question.upvotedUsers;
        const userIndex = upvotedUsers ? upvotedUsers.findIndex(userId => userId === props.user.userId) : -1;
        if (userIndex !== -1) {
            upvotedUsers.splice(userIndex, 1);
        } else {
            upvotedUsers.push(props.user.userId);
        }
        const update = { upvotedUsers};
        batch.update(firestore.doc(`questions/${question.questionId}`), update);
        batch.commit();
    }

    const questionComment = (newComment: string, isTA: boolean) => {
        let update: Partial<FireDiscussionQuestion>
        if (isTA) {
            update = { taComment: newComment };
        } else {
            update = { studentComment: newComment };
        }
        firestore.doc(`questions/${question.questionId}`).update(update);
    };

    // const studentNoShow = () => {
    //     const batch = firestore.batch();
    //     const slotUpdate: Partial<FireQuestionSlot> = { status: 'no-show' };
    //     const questionUpdate: Partial<FireQuestion> = slotUpdate;
    //     batch.update(firestore.doc(`questionSlots/${question.questionId}`), slotUpdate);
    //     batch.update(firestore.doc(`questions/${question.questionId}`), questionUpdate);
    //     batch.commit();
    // };

    // const questionDone = () => {
    //     const batch = firestore.batch();
    //     const slotUpdate: Partial<FireQuestionSlot> = { status: 'resolved' };
    //     const questionUpdate: Partial<FireDiscussionQuestion> = {
    //         status: 'resolved',
    //     };
    //     batch.update(firestore.doc(`questionSlots/${question.questionId}`), slotUpdate);
    //     batch.update(firestore.doc(`questions/${question.questionId}`), questionUpdate);
    //     batch.commit();
    // };

    return (


        <div className="DiscussionQuestion">
            <div className="DiscussionContainer">
                <button className="Upvote" type="button" aria-label="upvote" onClick={upvoteQuestion} />
                <div className="UpvoteContainer">
                    <div className="Upvotes">{question.upvotedUsers ? question.upvotedUsers.length : 0}</div>
                    <div className="QuestionBody">{question.content}</div>
                    <div className="RightBar">
                        <button className="commentBtn" onClick={() => setShowCommentBox(!showCommentBox)} type="button">
                            <Icon className="large" name="comment outline" />
                        </button>
                    </div>
                </div>
            </div>
            {(question.studentComment || question.taComment) &&
                    <CommentBox
                        studentComment={question.studentComment}
                        taComment={question.taComment}
                        studentCSS={studentCSS}
                    />
            }
            <div className="LowerDiscussionContainer"> 
                <div className="BottomBarContainer">
                    <div className="DiscussionTags">
                        {primaryTag && <SelectedTags tag={primaryTag} isSelected={false} isDiscussion={true}/>}
                        {secondaryTag && <SelectedTags tag={secondaryTag} isSelected={false} isDiscussion={true}/>}
                    </div>
                    <p className="Time">
                    posted at&nbsp;{<Moment date={question.timeEntered.toDate()} interval={0} format={'hh:mm A'} />}
                    </p>
                </div>
                { props.includeRemove && !props.isPast &&
            <div className="Buttons">
                <hr />
                <p className="Remove" onClick={retractQuestion}>
                    <Icon name="close" /> Remove
                </p>

            </div> }
            </div>
            {showCommentBox && <div className="CommentBox">
                <div className="commentTopBar">
                    <img
                        className="userInformationImg"
                        src={user.photoUrl || '/placeholder.png'}
                        alt={user ? `${user.firstName} ${user.lastName}` : 'unknown user'}
                    />
                    <span className="userInformationName">
                        {user.firstName} {user.lastName}
                    </span>
                </div>
                <EditComment
                    initComment={comment || ""}
                    onValueChange={(newComment: string) => {
                        questionComment(newComment, props.isTA);
                        setShowCommentBox(false);}} 
                    onCancel={() => {setShowCommentBox(false);}}
                />
            </div>}
    
        </div>
    )
}

type EditCommentProps = {
    readonly initComment: string;
    readonly onValueChange: Function;
    readonly onCancel: Function;
}

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
                    onChange={(evt) => { setComment(evt.target.value) }}
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

    // Not editable
    return (
        <div className="commentBody">
            <Linkify tagName="p">
                {comment !== "" && comment !== undefined ? comment : "Add a comment..."}
            </Linkify>
            <button
                type="button"
                className="link-button commentEdit"
                onClick={(evt) => {
                    evt.preventDefault();
                    setPrevComment(comment);
                    setEditable(true);
                }}
            >
                edit
            </button>
        </div>
    );

}

type CommentBoxProps = {
    readonly studentComment?: string;
    readonly taComment?: string;
    readonly studentCSS?: string;
}

const CommentBox = (props: CommentBoxProps) => {
    return (
        <div className="CommentBox">
            {props.studentComment && (
                <Linkify className={'Question' + props.studentCSS} tagName="p">
                    Student Comment: {props.studentComment}
                </Linkify>
            )}
            {props.taComment && (
                <Linkify className={'Question' + props.studentCSS} tagName="p">
                    TA Comment: {props.taComment}
                </Linkify>
            )}
        </div>
    )
}

export default DiscussionQuestion;