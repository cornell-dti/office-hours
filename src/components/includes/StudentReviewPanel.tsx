import React , { useState, useEffect } from 'react';
import { Dropdown } from "semantic-ui-react";
import {  doc, getDoc } from 'firebase/firestore';
import { firestore } from "../../firebase";
import StudentReviewCard from "./StudentReviewCard";

type StudentReviewPanelProps = {
    user: FireUser;
}

type FeedbackList = {
    efficiency: number;
    organization: number;
    overallExperience: number;
    timeStamp: FireTimestamp;
    writtenFeedback: string;
}

const StudentReviewPanel = ( { user }: StudentReviewPanelProps) => {
    const [reviewData, setReviewData] = useState<FeedbackList[]>([]);

    const [filter, setFilter] = useState<string>("Most recent");
    const [sortedReviews, setSortedReviews] = useState<FeedbackList[]>([]);

    // Filter dropdown options
    const filterOptions = [
        { key: "most", text: "Most recent", value: "Most recent" },
        { key: "least", text: "Least recent", value: "Least recent" },
        { key: "high", text: "Highest rating", value: "Highest rating" },
        { key: "light", text: "Lowest rating", value: "Lowest rating" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(firestore, "users", user.userId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()){
                    const feedbackList: FeedbackList[] = docSnap.data().feedbackList;
                    setReviewData(feedbackList);
                }
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error("Error fetching data: ", err);
            }
        };
        fetchData();
    }, [user.userId])

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
                sortedData.sort((a, b) => b.timeStamp.toDate().getTime() - a.timeStamp.toDate().getTime());
                break;
            case ("Least recent"):
                sortedData.sort((a, b) => a.timeStamp.toDate().getTime() - b.timeStamp.toDate().getTime());
                break;
            case ("Highest rating"):
                sortedData.sort((a, b) => {
                    const aRating = ((a.overallExperience ?? 0) + (a.efficiency ?? 0) + (a.organization ?? 0));
                    const bRating = ((b.overallExperience ?? 0) + (b.efficiency ?? 0) + (b.organization ?? 0));
                    return bRating - aRating;
                });
                break;
            case ("Lowest rating"):
                sortedData.sort((a, b) => {
                    const aRating = ((a.overallExperience ?? 0) + (a.efficiency ?? 0) + (a.organization ?? 0));
                    const bRating = ((b.overallExperience ?? 0) + (b.efficiency ?? 0) + (b.organization ?? 0));
                    return aRating - bRating;
                });
                break;
            default:
                break;
        }
        setSortedReviews(sortedData);
    }, [filter, reviewData])
    
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
                            overall={review.overallExperience}
                            efficiency={review.efficiency}
                            organization={review.organization}
                            feedback={review.writtenFeedback}
                            date={review.timeStamp.toDate().toLocaleDateString()}
                        />
                    );
                })}
            </div>
        </div>
    );
};
export default StudentReviewPanel;
