import * as React from 'react';
import AddQuestion from '../includes/AddQuestion';

class QuestionView extends React.Component {
    render() {
        return (
            <div className="QuestionView">
                <AddQuestion studentName="Sangwoo Kim" studentPicture="../../media/peopleLogo.jpg"
                primaryTags={["Assignment", "Lecture", "Exam", "General"]}
                secondaryTags={["Assignment 1", "Assignment 2", "Assignment 3", "Assignment 4", "Assignment 5",
                "Assignment 6"]}
                topicTags={["Causality", "Probability", "Inference", "Recursion", "Regression", "Classification",
                "Nearest Neighbor", "Visualization"]}/>
            </div>
        );
    }
}

export default QuestionView;
