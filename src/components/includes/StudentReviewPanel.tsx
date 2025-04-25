import React from 'react';
import StudentReviewCard from "./StudentReviewCard";
import reviewData from "../../review_dummy.json";
import { Dropdown } from "semantic-ui-react";

const StudentReviewPanel = () => {
    const [filter, setFilter] = React.useState<string>("Most recent");

    // Filter dropdown options
    const filterOptions = [
        { key: "most", text: "Most recent", value: "Most recent" },
        { key: "least", text: "Least recent", value: "Least recent" },
        { key: "high", text: "Highest rating", value: "Highest rating" },
        { key: "light", text: "Lowest rating", value: "Lowest rating" },
    ];

    const FilterDropdown = () => (
        <div style={{ display: "flex", alignItems: "center" }}>
            <label style={{ fontSize: "16px", marginRight: "8px" }}>
                Sort by
            </label>
            <Dropdown
                style={{ width: "150px" }}
                placeholder={filter}
                fluid
                selection
                options={filterOptions}
                onChange={(e, data) => setFilter(data.value as string)}
            />
        </div>
    );
    
    switch (filter) {
        case ("Most recent"):
            reviewData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            break;
        case ("Least recent"):
            reviewData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            break;
        case ("Highest rating"):
            reviewData.sort((a, b) => {
                const aRating = (a.overall + a.efficiency + a.organization);
                const bRating = (b.overall + b.efficiency + b.organization);
                return bRating - aRating;
            });
            break;
        case ("Lowest rating"):
            reviewData.sort((a, b) => {
                const aRating = (a.overall + a.efficiency + a.organization);
                const bRating = (b.overall + b.efficiency + b.organization);
                return aRating - bRating;
            });
            break;
        default:
    }
    
    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                }}
            >
                <h2
                    style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        margin: 0,
                    }}
                >
                    Student Reviews ({reviewData.length})
                </h2>
                <FilterDropdown />
            </div>
            {reviewData.map((review, index) => {
                return (
                    <StudentReviewCard
                        key={index}
                        overall={review.overall}
                        efficiency={review.efficiency}
                        organization={review.organization}
                        feedback={review.feedback}
                        date={review.date}
                    />
                );
            })}
        </div>
    );
};
export default StudentReviewPanel;
