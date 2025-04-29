import React from "react";

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
    const percentage = score !== undefined ? (score / 5) * 100 + "%" : "0%";
    const barClass = score !== undefined ? "percentage-bar" : "percentage-bar-undefined";

    return (
        <div className="percentage-bar-container">
            <div className="percentage-label"> 
                {label} 
            </div>
            <div className={barClass}>
                <div className="percentage-bar-fill" style={{ width: percentage}} />
            </div>
            <div className="score-text">
                {score !== undefined ? score.toFixed(1) : "N/A"}            
            </div>
        </div>
    );
};

// Single review card component
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
