import React, { useState } from 'react';
import Moment from 'react-moment';

type Props = {
    currentUser: FireUser;
    addCommentsHelper: (newComment: string) => void;
}

const NewComment = ({currentUser, addCommentsHelper} : Props) => {
    const [currentComment, setCurrentComment] = useState('');

    const newCommentHandler = () => {
        addCommentsHelper(currentComment);
        setCurrentComment('');
    }
    
    return (
        <div className="newCommentContainer">
            <div className="newCommentWrapper">
                { currentUser &&
                <div className="newCommentHeader">
                    <img src={typeof currentUser.photoUrl !== 'undefined' ? currentUser.photoUrl : '/placeholder.png'} className="newCommenterProfile" />
                    <h3 className="newCommenterName">{`${currentUser.firstName} ${currentUser.lastName} (You)`}</h3>
                </div>

                }
                <input placeholder="Type your reply here..." className="newCommentInput" 
                onChange={e => setCurrentComment(e.target.value)} value={currentComment} />
                <button onClick={newCommentHandler} className="addNewCommentButton">Post</button>
            </div>
        </div>
    )
}

export default NewComment;