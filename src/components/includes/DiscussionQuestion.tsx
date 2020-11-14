import React from 'react';
import Moment from 'react-moment';
import { Icon } from 'semantic-ui-react';
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
                </div>
            </div>
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
    
        </div>
    )
}

export default DiscussionQuestion;