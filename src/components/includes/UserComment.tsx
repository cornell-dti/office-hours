import React, { useState } from 'react';
import Moment from 'react-moment';
import { updateCurrentComment } from '../../firebasefunctions/sessionQuestion';
import Dots from '../../media/dots.svg';

type Props = FireComment & {
    poster: FireUser;
    questionId: string;
    currentUser: FireUser;
    deleteCommentsHelper: (commentId: string, questionId: string) => void;
}

const UserComment = ({content, poster, timePosted, isTA, commenterId, commentId, 
    questionId, deleteCommentsHelper, currentUser}: Props) => {

    const [commentContent, setCommentContent] = useState(content);
    const [isCommentEditable, setCommentEditable] = useState(false);
    const [deleteShow, setDeleteShow] = useState(false);

    const handleEditCommentPost = () => {
        updateCurrentComment(commentId, questionId, commentContent);
        setCommentEditable(false);
    }

    return (
        <div className={"userComment " + (isTA ? "taComment": "")}>
            <div className="commentInnerWrapper">
                {poster ?
                    <div className="commentHeader">
                        <div className="commentNameAndProfile">
                            <img
                                className="commenterProfile"
                                src={typeof poster.photoUrl !== 'undefined' 
                                    ? poster.photoUrl : '/placeholder.png'}
                            />
                            <h3 className="commenterName">{poster.firstName + ' ' + poster.lastName}</h3>
                        </div>
                        <Moment date={timePosted.toDate()} format="hh:mm A" className="commentTime"/>
                    </div> :
                    <div className="commentHeader">
                        <div className="commentNameAndProfile">
                            <img className="commenterProfile" src={'/placeholder.png'} />
                            <h3 className="commenterName">{isTA ? 'TA' : 'You'}</h3>
                        </div>
                        <Moment date={timePosted.toDate()} format="hh:mm A" className="commentTime"/>
                    </div>
                }
                {isCommentEditable ? 
                    <input
                        placeholder="Type your reply here..."
                        className="newCommentInput" 
                        onChange={e => setCommentContent(e.target.value)}
                        value={commentContent}
                    /> : 
                    <div className={(currentUser && currentUser.userId === commenterId) 
                        ? "commentBody" : "commentBody notUserComment"}
                    >
                        {commentContent}
                    </div>
                }
                {currentUser && currentUser.userId === commenterId &&
                    <div className="commentButtons">
                        { isCommentEditable ?
                            <button
                                className="commentButton commentPost" 
                                onClick={handleEditCommentPost}
                                type="button"
                            >Post</button>
                            :
                            <div className="notEditableButtonsWrapper">
                                <button
                                    className="commentButton commentEdit"
                                    onClick={() => setCommentEditable(true)} 
                                    type="button"
                                >Edit</button>
                                <div className="showDeleteMenu" >
                                    <img className="deleteDots" src={Dots} onClick={() => setDeleteShow(!deleteShow)}/>
                                    {deleteShow && 
                                    <button
                                        className="commentButton commentDelete" 
                                        onClick={() => deleteCommentsHelper(commentId, questionId)}
                                        type="button"
                                    >Delete</button>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                }
            </div>
        </div>
    )
}

export default UserComment;