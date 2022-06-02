import React from 'react';
import UserComment from './UserComment';
import NewComment from './NewComment'

type Props = {
    comments: FireComment[];
    users: { readonly [userId: string]: FireUser};
    currentUser: FireUser;
    addCommentsHelper: (newComment: string) => void;
    questionId: string;
    switchCommentsVisible: () => void;
    deleteCommentsHelper: (commentId: string, questionId: string) => void;
    showNewComment: boolean;
    isPast: boolean;
}

const CommentsContainer = ({ comments, users, currentUser, addCommentsHelper, questionId, 
    switchCommentsVisible, deleteCommentsHelper, showNewComment, isPast }: Props) => {

    const sortedComments = comments.sort((c1, c2) => c2.timePosted.seconds - c1.timePosted.seconds);
    return (
        <div className="commentsContainer">
            {(showNewComment || comments.length > 0) && 
                <div className="commentsLine" onClick={switchCommentsVisible} />
            }
            <div className="allCommentsWrapper">
                {showNewComment && !isPast && <NewComment
                    currentUser={currentUser} 
                    addCommentsHelper={addCommentsHelper}
                />}
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
            </div>
        </div>

    )
}

export default CommentsContainer;