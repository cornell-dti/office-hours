import React from 'react';
import UserComment from './UserComment';
import NewComment from './NewComment'
import { useParameterizedComments } from '../../firehooks';

type Props = {
    users: { readonly [userId: string]: FireUser };
    currentUser: FireUser;
    addCommentsHelper: (newComment: string) => void;
    questionId: string;
    switchCommentsVisible: () => void;
    deleteCommentsHelper: (commentId: string, questionId: string) => void;
    showNewComment: boolean;
    isPast: boolean;
}

const CommentsContainer = ({ users, currentUser, addCommentsHelper, questionId,
    switchCommentsVisible, deleteCommentsHelper, showNewComment, isPast }: Props) => {

    const comments = useParameterizedComments(questionId);
    const sortedComments = [...comments].sort((c1, c2) => c1.timePosted.seconds - c2.timePosted.seconds);
    return (
        <div className="commentsContainer">
            {(showNewComment || comments.length > 0) &&
                <div className="commentsLine" onClick={switchCommentsVisible} />
            }
            <div className="allCommentsWrapper">
                {sortedComments.map((comment) => {
                    const poster = users[comment.commenterId];
                    return <UserComment
                        {...comment}
                        poster={poster}
                        questionId={questionId}
                        deleteCommentsHelper={deleteCommentsHelper}
                        currentUser={currentUser}
                        key={comment.commentId}
                        isPast={isPast}
                    />
                })}
                {showNewComment && !isPast && <NewComment
                    currentUser={currentUser}
                    addCommentsHelper={addCommentsHelper}
                />}
            </div>
        </div>

    )
}

export default CommentsContainer;