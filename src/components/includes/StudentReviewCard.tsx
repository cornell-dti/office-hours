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
    const percentage = score ? (score / 5) * 100 + "%" : "0%";

    return (
        <div style={{ display: "flex", alignItems: "center", margin: "16px"}}>
            <div style={{ width: "128px", textAlign: "left" }}> {label} </div>
            <div style={{ flexGrow: 1, backgroundColor: "#e5e7eb", height: "8px", borderRadius: "5px" }}>
                <div style={{ backgroundColor: "#2563eb", height: "8px", borderRadius: "5px", width: percentage}} />
            </div>
            <div style={{ width: "32px", color: "#1f2937", textAlign: "left", marginLeft: "20px" }}>
                {score}
            </div>
        </div>
    );
};

// Single review card component
const StudentReviewCard = ({ feedback, overall, efficiency, organization, date}: StudentReviewCardProps) => {
    return (
        <div
            style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e5e7eb",
                padding: "32px",
                marginBottom: "24px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "48px",
            }}
        >
            <div style={{ width: "40%" }}>
                <PercentageBar label="Overall" score={overall} />
                <PercentageBar label="Efficiency" score={efficiency} />
                <PercentageBar label="Organization" score={organization} />
            </div>
            <div style={{ width: "60%" }}>
                <p style={{ textAlign: "left" }}>{feedback}</p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "100px" }}>
                <p style={{ textAlign: "right", fontSize: "12px", color: "#6b7280" }}>
                    {date}
                </p>
            </div>
        </div>
    );
};

export default StudentReviewCard;
