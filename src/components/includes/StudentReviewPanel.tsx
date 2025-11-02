import React , { useState, useEffect } from 'react';
import { Dropdown } from "semantic-ui-react";
import StudentReviewCard from "./StudentReviewCard";
import {reviewData} from "../../review_dummy";

const StudentReviewPanel = () => {
    const [filter, setFilter] = useState<string>("Most recent");
    const [sortedReviews, setSortedReviews] = useState(reviewData);

    // Filter dropdown options
    const filterOptions = [
        { key: "most", text: "Most recent", value: "Most recent" },
        { key: "least", text: "Least recent", value: "Least recent" },
        { key: "high", text: "Highest rating", value: "Highest rating" },
        { key: "light", text: "Lowest rating", value: "Lowest rating" },
    ];

    const FilterDropdown = () => (
        <div className="filter-dropdown">
            <p className="filter-text">Sort by</p>
            <Dropdown
                placeholder={filter}
                fluid
                selection
                options={filterOptions}
                onChange={(e, data) => setFilter(data.value as string)}
            />
        </div>
    );
    
    useEffect(() => {
        const sortedData = [...reviewData];

        switch (filter) {
            case ("Most recent"):
                sortedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                break;
            case ("Least recent"):
                sortedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                break;
            case ("Highest rating"):
                sortedData.sort((a, b) => {
                    const aRating = ((a.overall ?? 0) + (a.efficiency ?? 0) + (a.organization ?? 0));
                    const bRating = ((b.overall ?? 0) + (b.efficiency ?? 0) + (b.organization ?? 0));
                    return bRating - aRating;
                });
                break;
            case ("Lowest rating"):
                sortedData.sort((a, b) => {
                    const aRating = ((a.overall ?? 0) + (a.efficiency ?? 0) + (a.organization ?? 0));
                    const bRating = ((b.overall ?? 0) + (b.efficiency ?? 0) + (b.organization ?? 0));
                    return aRating - bRating;
                });
                break;
            default:
                break;
        }
        setSortedReviews(sortedData);
    }, [filter])
    
    return (
        <div className="student-review-container">
            <div className="student-review-header">
                <div className="header-text-container">
                    <p className="header-text">Student Reviews </p>
                    <p className="review-count">{`(${sortedReviews.length})`}</p>
                </div>    
                <FilterDropdown />
            </div>
            <div className="reviews">
                {sortedReviews.map((review) => {
                    return (
                        <StudentReviewCard
                            overall={review.overall}
                            efficiency={review.efficiency}
                            organization={review.organization}
                            feedback={review.feedback}
                            date={review.date}
                        />
                    );
                })}
            </div>
        </div>
    );
};
export default StudentReviewPanel;
