import * as React from 'react';
import '../../styles/QuestionView.css';
import QuestionHeader from '../includes/QuestionHeader';

class QuestionView extends React.Component {
    render() {
        return (
            <div className="QuestionView">
                <QuestionHeader courseName="CS 3110" profName="Michael Clarkson"
                primaryTags={["Assignment 1", "Assignment 2", "Prelim 1 Feedback"]}
                secondaryTags={["Q1", "Q2", "Q3", "Q4", "Q5", "Conceptual", "Clarification", "Recursion", "Conditional",
                "Data", "Debugging"]}/>
            </div>
        );
    }
}

export default QuestionView;
