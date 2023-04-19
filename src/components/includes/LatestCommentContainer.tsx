import React from 'react';
import LatestComment from './LatestComment';
import { useParameterizedComments } from '../../firehooks';
import expand from '../../media/expandPreview.svg'

type Props = {
    users: { readonly [userId: string]: FireUser };
    questionId: string;
    reply: () => void;
    newComment: boolean | undefined;
}

const LatestCommentContainer = ({ users, questionId, reply, newComment}: Props) => {

    const comments = useParameterizedComments(questionId);
    const sortedComments = [...comments].sort((c1, c2) => c2.timePosted.seconds - c1.timePosted.seconds);
    const latestComment = sortedComments.length > 0 ? sortedComments[0] : undefined;

    return (
        <div>
            {latestComment !== undefined && 
            <div className="commentPreview">
                <img className="expandPreview" src={expand} alt="Expand icon" onClick={reply}/>
                <LatestComment
                    {...latestComment}
                    poster={users[latestComment.commenterId]}
                    newComment={newComment}
                />
            </div>}
        </div>
    )
}

export default LatestCommentContainer;