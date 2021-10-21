import React from 'react';
import UserComment from './UserComment';
import NewComment from './NewComment'

type Props = {
    comments: FireComment[];
    users: { readonly [userId: string] : FireUser};
    currentUser: FireUser;
    addCommentsHelper: (newComment: string) => void;
    questionId: string;
    switchCommentsVisible: () => void;
    deleteCommentsHelper: (commentId: string, questionId: string) => void;
    showNewComment: boolean;
}

const CommentsContainer = ({ comments, users, currentUser, addCommentsHelper, questionId, switchCommentsVisible, deleteCommentsHelper, showNewComment } : Props) => {

    let sortedComments = comments.sort((c1, c2) => c2.timePosted.seconds - c1.timePosted.seconds);
    console.log(users);
    return (
        <div className="commentsContainer">
            <div className="commentsLine" onClick={switchCommentsVisible}></div>
            <div className="allCommentsWrapper">
                {showNewComment && <NewComment currentUser={currentUser} addCommentsHelper={addCommentsHelper}/>}
                {sortedComments.map((comment, i) => {
                    let poster = users[comment.commenterId];
                    return <UserComment {...comment} poster={poster} questionId={questionId} deleteCommentsHelper={deleteCommentsHelper} currentUser={currentUser} key={comment.commentId}/>
                })}
            </div>
        </div>

    )
}

export default CommentsContainer;