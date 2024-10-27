import React, { useState, useEffect } from "react";
import "../../styles/WrappedCountdown.scss";
import cone from "../../media/wrapped/cone.svg";
import { WRAPPED_START_DATE, WRAPPED_LAUNCH_DATE } from "../../constants";
type WrappedDate = {
    launchDate: Date;
    startDate: Date;
};
type RemainingTime = {
    days: number;
    hours: number;
    minutes: number;
};
// Declare interface to takes in the setter setDisplayWrapped as a prop
interface WrappedCountdownProps {
    setDisplayWrapped: React.Dispatch<React.SetStateAction<boolean>>; // Define prop type for setter
}
const WrappedCountdown: React.FC<WrappedCountdownProps> = ({ setDisplayWrapped }) => {
    const handleButtonClick = () => {
        // Call the setter function to change the state in the parent
        setDisplayWrapped(true); // Set to true to show the modal
    };
    const launch = new Date(WRAPPED_LAUNCH_DATE);
    const start = new Date(WRAPPED_START_DATE);
    const date: WrappedDate = {
        launchDate: launch,
        startDate: start,
    };
    // Define a zeroCounter object for comparison when there's no time remaining
    const zeroCounter = { days: 0, hours: 0, minutes: 0 };
    // Helper function to calculate the remaining time in days, hours, and minutes from start date to launch date
    const calculateTimeRemaining = (dateProps: WrappedDate): RemainingTime => {
        // Calculate the time remaining (in milliseconds) between the launch date and start date
        const gap = dateProps.launchDate.getTime() - new Date().getTime();
        // Calculate days, hours, and minutes remaining
        const days = Math.floor(gap / (1000 * 60 * 60 * 24));
        const hours = Math.floor((gap / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((gap / (1000 * 60)) % 60);
        return { days, hours, minutes };
    };
    // Initialize countdown state using the calculateTimeRemaining function
    const [timeRemaining, setTimeRemaining] = useState<RemainingTime>(calculateTimeRemaining(date));
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining(date));
        }, 1000);
        return () => clearInterval(interval);
    }, [date]);
    // Prepend the days, hours, and minutes if they're single digits
    const prependZero = (num: number): string => (num < 10 ? `0${num}` : `${num}`);
    const isZeroCounter =
        timeRemaining.days === zeroCounter.days &&
        timeRemaining.hours === zeroCounter.hours &&
        timeRemaining.minutes === zeroCounter.minutes;
    return (
        <div className="countdownUpdates">
            <div className="countdownContainer">
                {!isZeroCounter ? (
                    <>
                        <div>
                            <div className="countdownContainer_boxes">{prependZero(timeRemaining.days)}</div>
                            <p className="counter_sub">DAYS</p>
                        </div>
                        <div>
                            <div className="countdownContainer_boxes">{prependZero(timeRemaining.hours)}</div>
                            <p className="counter_sub">HOURS</p>
                        </div>
                        <div>
                            <div className="countdownContainer_boxes">{prependZero(timeRemaining.minutes)}</div>
                            <p className="counter_sub">MINUTES</p>
                        </div>
                        <div className="textContainer">
                            <p className="top">Queue Me In</p>
                            <p className="bottom">WRAPPED</p>
                        </div>
                    </>
                ) : (
                    <>
                        <button type="button" className="viewWrap" onClick={handleButtonClick}>
                            View
                        </button>
                        <img className="textContainer cone" src={cone} alt="icon" />
                    </>
                )}
            </div>
        </div>
    );
};
export default WrappedCountdown;
