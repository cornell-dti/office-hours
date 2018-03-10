import * as React from 'react';
import '../../styles/QuestionView.css';
import AddQuestion from '../includes/AddQuestion';

class QuestionView extends React.Component {
    render() {
        return (
            <div className="QuestionView">
                <AddQuestion
                    courseName="CS 3110"
                    profName="Michael Clarkson"
                    primaryTags={['Assignment 1', 'Assignment 2', 'Prelim 1 Feedback']}
                    secondaryTags={['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Conceptual', 'Clarification', 'Recursion',
                        'Conditional', 'Data', 'Debugging']}
                    topicTags={['Dogs', 'Cats', 'Rabbits']}
                />
            </div>
        );
    }
}

export default QuestionView;
