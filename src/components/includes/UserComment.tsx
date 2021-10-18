import React, { useState } from 'react';
import Moment from 'react-moment';

type Props = FireComment & {
    poster: FireUser
}

const UserComment = ({content, poster, timePosted, isTA}: Props) => {

    const [commentContent, setCommentContent] = useState(content);
    const [isCommentEditable, setCommentEditable] = useState(false);
    

    return (
        <div className={"userComment " + (isTA ? "taComment": "")}>
            <div className="commentInnerWrapper">
                {poster &&
                    <div className="commentHeader">
                        <div className="commentNameAndProfile">
                            <img className="commenterProfile" src={typeof poster.photoUrl !== 'undefined' 
                            ? poster.photoUrl : '/placeholder.png'} />
                            <h3 className="commenterName">{poster.firstName + ' ' + poster.lastName}</h3>
                        </div>
                        <Moment date={timePosted.toDate()} format="hh:mm A" className="commentTime"/>
                    </div>
                }
                
                <div className="commentBody">
                    {commentContent}
                </div>
                <div className="commentButtons">
                    { isCommentEditable ?
                        <button className="commentButton commentPost">Post</button>
                    :
                    <div className="notEditableButtonsWrapper">
                        <button className="commentButton commentEdit" onClick={() => setCommentEditable(true)}>Edit</button>
                        <button className="commentButton commentDelete">Delete</button>
                    </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default UserComment;