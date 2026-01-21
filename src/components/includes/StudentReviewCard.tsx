import React, {useEffect, useState} from "react";

type StudentReviewCardProps = {
    overall: number | undefined;
    efficiency: number | undefined;
    organization: number | undefined;
    feedback: string;
    date: string;
};

type PercentageBarProps = {
    label: string;
    score: number | undefined;
};

const PercentageBar = ({ label, score }: PercentageBarProps) => {
    // Calculate width based on score out of 5
    const [width, setWidth] = useState("0%");
    const percentage = score !== undefined ? (score / 5) * 100 + "%" : "0%";
    const barClass = score !== undefined ? "percentage-bar" : "percentage-bar-undefined";


    useEffect(() => {
        setWidth("0%");
        const timer = setTimeout(() => {
            setWidth(percentage);
        }, 50);
        return () => clearTimeout(timer);
    }, [score, percentage]);

    return (
        <div className="percentage-bar-container">
            <div className="percentage-label">
                {label}
            </div>
            <div className={barClass}>
                <div
                    className="percentage-bar-fill"
                    style={{
                        width,
                        transition: `width ${800}ms ease-out`,
                    }}
                />
            </div>
            <div className="score-text">
                {score ? Math.round(score) : "N/A"}
            </div>
        </div>      
    );
};

/**
 * `StudentReviewCard` Component - Displays a single review card with student's feedback 
 * as well as ratings on the TA's organization, efficiency, and overall performance.
 * 
 * @param feedback - The feedback text provided by the student.
 * @param overall - The overall performance rating of the TA as a `PercentageBar` out of 5.
 * @param efficiency - The efficiency rating of the TA as a `PercentageBar` out of 5.
 * @param organization - The organization rating of the TA as a `PercentageBar` out of 5.
 * @param date - The date when the feedback was provided.  
 */
const StudentReviewCard = ({ feedback, overall, efficiency, organization, date}: StudentReviewCardProps) => {
    const isFeedbackEmpty = feedback.trim() === "";
    return (
        <div className="review-container">
            <div className="metrics-container">
                <PercentageBar label="Overall" score={overall} />
                <PercentageBar label="Efficiency" score={efficiency} />
                <PercentageBar label="Organization" score={organization} />
            </div>
            <div className="review-text-container">
                <div className="feedback-container">
                    <p className={`feedback-text ${isFeedbackEmpty ? "empty" : ""}`}>
                        {isFeedbackEmpty ? "No additional comments." : feedback}
                    </p>
                </div>
                <div className="date-container">
                    <p className="date-text">{date}</p>
                </div>
            </div>
        </div>
    );
};

export default StudentReviewCard;
