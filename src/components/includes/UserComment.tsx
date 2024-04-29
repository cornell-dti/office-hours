import React, { useState } from 'react';
import Moment from 'react-moment';
import Linkify from 'react-linkify'
import { updateCurrentComment } from '../../firebasefunctions/sessionQuestion';
import Dots from '../../media/dots.svg';

type Props = FireComment & {
    poster: FireUser;
    questionId: string;
    currentUser: FireUser;
    deleteCommentsHelper: (commentId: string, questionId: string) => void;
    isPast: boolean;
}

const UserComment = ({ content, poster, timePosted, isTA, commenterId, commentId,
    questionId, deleteCommentsHelper, currentUser, isPast }: Props) => {

    const [commentContent, setCommentContent] = useState(content);
    const [isCommentEditable, setCommentEditable] = useState(false);
    const [deleteShow, setDeleteShow] = useState(false);

    const handleEditCommentPost = () => {
        if (isPast) return;
        updateCurrentComment(commentId, questionId, commentContent);
        setCommentEditable(false);
    }

    return (
        <div className={"userComment " + ((currentUser && (commenterId === currentUser.userId)) ? "yourComment" : "")}>
            <div className="commentInnerWrapper">
                {poster ?
                    <div className="commentHeader">
                        <div className="commentNameAndProfile">
                            <img
                                className="commenterProfile"
                                src={typeof poster.photoUrl !== 'undefined'
                                    ? poster.photoUrl : '/placeholder.png'}
                                alt="Profile"
                            />
                            <h3 className="commenterName">{poster.firstName + ' ' + poster.lastName}</h3>
                        </div>
                        <Moment date={timePosted.toDate()} format="hh:mm A" className="commentTime" />
                    </div> :
                    <div className="commentHeader">
                        <div className="commentNameAndProfile">
                            <img className="commenterProfile" alt="Anonymous profile" src={'/placeholder.png'} />
                            <h3 className="commenterName">{isTA ? 'TA' : 'You'}</h3>
                        </div>
                        <Moment date={timePosted.toDate()} format="hh:mm A" className="commentTime" />
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
                        <Linkify>{commentContent}</Linkify>
                    </div>
                }
                {currentUser && currentUser.userId === commenterId &&
                    <div className="commentButtons">
                        {isCommentEditable ?
                            <button
                                className="commentButton commentPost"
                                onClick={handleEditCommentPost}
                                type="button"
                            >Post</button>
                            :
                            <div className="notEditableButtonsWrapper">
                                {/* <button
                                    className="commentButton commentEdit"
                                    onClick={() => {
                                        if (!isPast) setCommentEditable(true)
                                    }} 
                                    type="button"
                                >Edit</button> */}
                                <div className="showDeleteMenu" >
                                    <div
                                        className="deleteDots"
                                        onClick={() => {
                                            if (!isPast) setDeleteShow(!deleteShow);
                                        }}
                                    >
                                        <img
                                            className="deleteDots"
                                            src={Dots}
                                            alt="Hide or show delete"

                                        />
                                    </div>
                                    {deleteShow &&
                                        <div
                                            className={`commentButton commentDelete
                                        ${(currentUser && (commenterId === currentUser.userId)) ? ' myDelete' : ''}`}
                                            onClick={() => {
                                                if (!isPast) deleteCommentsHelper(commentId, questionId);
                                            }}

                                        >Delete</div>
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