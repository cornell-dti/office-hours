import React from 'react';
import Moment from 'react-moment';

type Props = FireComment & {
    poster: FireUser;
    newComment: boolean | undefined;
}

const LatestComment = ({ content, timePosted, isTA, poster, newComment}: Props) => {

    return (
        <div className={"userComment " + (newComment ? "newComment Preview" : "Preview")}>
            <div className="commentInnerWrapper">
                {poster ?
                    <div className="commentHeader Preview">
                        <div className="commentNameAndProfile Preview">
                            <img
                                className="commenterProfile"
                                src={typeof poster.photoUrl !== 'undefined'
                                    ? poster.photoUrl : '/placeholder.png'}
                                alt="Profile"
                            />
                            <h3 className="commenterName">{poster.firstName + ' ' + poster.lastName}</h3>
                        </div>
                        <div className="previewCommentBody">{content}</div>
                        <Moment date={timePosted.toDate()} format="hh:mm A" className="commentTime Preview" />
                    </div> :
                    <div className="commentHeader Preview">
                        <div className="commentNameAndProfile Preview">
                            <img className="commenterProfile" alt="Anonymous profile" src={'/placeholder.png'} />
                            <h3 className="commenterName">{isTA ? 'TA' : 'You'}</h3>
                        </div>
                        <div className="previewCommentBody">{content}</div>
                        <Moment date={timePosted.toDate()} format="hh:mm A" className="commentTime Preview" />
                    </div>
                }
            </div>
        </div>
    )
}

export default LatestComment;