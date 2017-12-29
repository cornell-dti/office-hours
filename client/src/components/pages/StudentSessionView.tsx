import * as React from 'react';
import '../../styles/StudentSessionView.css';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';
import SessionPopularQuestionsContainer from '../includes/SessionPopularQuestionsContainer';
import DetailedQuestionView from '../includes/DetailedQuestionView';

class StudentSessionView extends React.Component {
    render() {
        return (
            <div className="StudentSessionView">
                <DetailedQuestionView
                    studentName="Edgar Stewart"
                    studentQuestion="How do I start Assignment 3?"
                    tags={["Assignment 1", "Q4", "Recursion", "Conceptual"]}
                    group={["Joshua Tran", "Bill Oliver", "Patrick Gross", "Harvey Estrada"]}
                />
                <SessionInformationHeader
                    courseName="CS 3110"
                    profName="Michael Clarkson"
                    queueSize={14}
                    date="Wednesday, 8 Nov"
                    time="10:00 AM - 11:00 AM"
                    location="G23 Gates Hall"
                />
                <SessionPopularQuestionsContainer />
                <SessionQuestionsContainer />
            </div>
        );
    }
}

export default StudentSessionView;