import React from 'react';
import Chalkboard from '../../media/chalkboard-teacher.svg';

type Props = {
    showBanner: boolean;
    setShowBanner: (newShow: boolean) => void;
    timeWarning: number | undefined;
    isTimeWarning: boolean;
}

const TimeLimitBanner = ({showBanner, setShowBanner, timeWarning, isTimeWarning }: Props) => {

    const warningText = (typeof timeWarning === 'undefined') ? 'You are almost out of time for this question' : 
        `You have ${timeWarning} minutes remaining for this question.`;

    return (
        <>
            {showBanner && 
            <div className="bannerContainer">
                <img src={Chalkboard} alt="Chalkboard" />
                <div className="label">{isTimeWarning ? warningText
                    : 'Your time is up for this question!'}</div>
                <div className="button" onClick={() => setShowBanner(false)}>
                    GOT IT
                </div>
            </div>
            }
        </>
    )
}

export default TimeLimitBanner;

