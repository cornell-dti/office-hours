import React, { useState, useEffect } from "react";
import "../../styles/WrappedCountdown.scss";
import ConfettiExplosion from "react-confetti-explosion";
import cone from "../../media/wrapped/cone.svg";
import ribbonBall from "../../media/wrapped/ribbonBall.svg";

type WrappedDate = {
    launchDate: Date;
    startDate: Date;
};
type RemainingTime = {
    days: number;
    hours: number;
    minutes: number;
    total: number
};
// Declare interface to takes in the setter setDisplayWrapped as a prop
interface WrappedCountdownProps {
    setDisplayWrapped: React.Dispatch<React.SetStateAction<boolean>>; // Define prop type for setter
    setCountdownZero: React.Dispatch<React.SetStateAction<boolean>>;
    wrappedDate: WrappedDate;
}
const WrappedCountdown: React.FC<WrappedCountdownProps> = ({ setDisplayWrapped, setCountdownZero, wrappedDate }) => {
    const handleButtonClick = () => {
        // Call the setter function to change the state in the parent
        setDisplayWrapped(true); // Set to true to show the modal
    };
    // Helper function to calculate the remaining time in days, hours, and minutes from start date to launch date
    const calculateTimeRemaining = (dateProps: WrappedDate): RemainingTime => {
        // Calculate the time remaining (in milliseconds) between the launch date and start date
        const time = dateProps.launchDate.getTime() - new Date().getTime();
        const gap = time < 0 ? 0 : time;
        // Calculate days, hours, and minutes remaining
        const days = Math.floor(gap / (1000 * 60 * 60 * 24));
        const hours = Math.floor((gap / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((gap / (1000 * 60)) % 60);
        return { days, hours, minutes, total: gap };
    };
    // Initialize countdown state using the calculateTimeRemaining function
    const [timeRemaining, setTimeRemaining] = useState<RemainingTime>(calculateTimeRemaining(wrappedDate));
    const [countDownClicked, setCountDownClicked] = useState<boolean>(false);
    const [confettiShown, setConfettiShown] = useState<boolean>(false);
    const [isZeroCounter, setIsZeroCounter] = useState<boolean>(false);

    // Countdown timer effect to update every second
    useEffect(() => {
        // Start a timer that updates the status of the countodwn every second, 
        // Avoids adding `timeRemaining` in dependency array to prevent infinite render
        const timer = setInterval(() => {
            const updatedTime = calculateTimeRemaining(wrappedDate);
            setTimeRemaining(updatedTime);

            // Stop the timer if countdown reaches zero
            if (updatedTime.total <= 0) {
                clearInterval(timer);
                setIsZeroCounter(true);
                setCountdownZero(true);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [wrappedDate, setCountdownZero]);

    // Prepend the days, hours, and minutes if they're single digits
    const prependZero = (num: number): string => (num < 10 ? `0${num}` : `${num}`);

    // Check that today is the start date or dates after the start date, then render the countdown if true
    const isStartDate = () => {
        const today = new Date();
        // To get the Date object with respect to Eastern Time, we must offset
        return today.getTime() >= wrappedDate.startDate.getTime();
    };

    return !isStartDate() ? null : countDownClicked ? (
        <div onClick={() => setCountDownClicked(false)}>
            <div className="countdownUpdates">
                <div className="countdownContainer">
                    {!isZeroCounter ? (
                        <>
                            <div>
                                <div className="countdownContainer_boxes">{prependZero(timeRemaining.days)}</div>
                                <p className="counter_sub">{timeRemaining.days <= 1 ? "DAY" : "DAYS"}</p>
                            </div>
                            <div>
                                <div className="countdownContainer_boxes">{prependZero(timeRemaining.hours)}</div>
                                <p className="counter_sub">{timeRemaining.hours <= 1 ? "HOUR" : "HOURS"}</p>
                            </div>
                            <div>
                                <div className="countdownContainer_boxes">{prependZero(timeRemaining.minutes)}</div>
                                <p className="counter_sub">{timeRemaining.minutes <= 1 ? "MINUTE" : "MINUTES"}</p>
                            </div>
                            <div className="textContainer">
                                <p className="top">Queue Me In</p>
                                <p className="bottom">WRAPPED</p>
                            </div>
                        </>
                    ) : (
                        <div className="launch">
                            <div className="post">
                                <div className="textContainer">
                                    <p className="top">Queue Me In</p>
                                    <p className="bottom">WRAPPED</p>
                                </div>
                                <div className="viewWrap" onClick={handleButtonClick}>
                                    View Now
                                </div>
                            </div>
                            {isZeroCounter && <ConfettiExplosion duration={3000} force={0.6} particleCount={200} />}
                            <img className="cone" src={cone} alt="icon" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : (
        <img className="ribbonBall" src={ribbonBall} alt="icon" onClick={() => setCountDownClicked(true)} />
    );
};
export default WrappedCountdown;
