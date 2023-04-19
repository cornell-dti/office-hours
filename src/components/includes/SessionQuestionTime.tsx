import React, { useState, useEffect } from 'react';

type Props = {
    assignedTime: number;
}

const SessionQuestionTime = ({ assignedTime }: Props) => {
    const [time, setTime] = useState(0);

    const formatTime = (milliseconds: number) => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

    useEffect(() => {
        const intervalId = setInterval(() => setTime(new Date().getTime() - assignedTime), 1000);
    
        return function cleanup() {
            clearInterval(intervalId);
        };
    }, [assignedTime]);

    return (
        <p className="Question Time">
            {formatTime(time)}
        </p>
    );
}
export default SessionQuestionTime;