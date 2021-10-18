import React from 'react';
import UserComment from './UserComment';
import NewComment from './NewComment'

type Props = {
    comments: FireComment[];
    users: { readonly [userId: string] : FireUser};
    currentUser: FireUser;
    addCommentsHelper: (newComment: string) => void;
}

const CommentsContainer = ({ comments, users, currentUser, addCommentsHelper } : Props) => {

    let sortedComments = comments.sort((c1, c2) => c2.timePosted.seconds - c1.timePosted.seconds)

    return (
        <div className="commentsContainer">
            <div className="commentsLine"></div>
            <div className="allCommentsWrapper">
                <NewComment currentUser={currentUser} addCommentsHelper={addCommentsHelper}/>
                {sortedComments.map((comment, i) => {
                    let poster = users[comment.commenterId];
                    return <UserComment {...comment} poster={poster} key={i}/>
                })}
            </div>
        </div>

    )
}

export default CommentsContainer;