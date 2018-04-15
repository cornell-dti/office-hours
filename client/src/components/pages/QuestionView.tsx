import * as React from 'react';

import AddQuestion from '../includes/AddQuestion';

class QuestionView extends React.Component {
    props: {
        match: {
            params: {
                sessionId: number
            }
        }
    };

    render() {
        const imageURL =
            'https://i2.wp.com/puppypassionn.org/wp-content/uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1';
        return (
            <div className="QuestionView">
                <AddQuestion
                    studentName="Sangwoo Kim"
                    studentPicture={imageURL}
                    primaryTags={['Assignment', 'Lecture', 'Exam', 'General']}
                    secondaryTags={['Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4',
                        'Assignment 5', 'Assignment 6']}
                    topicTags={['Causality', 'Probability', 'Inference', 'Recursion', 'Regression', 'Classification',
                        'Nearest Neighbor', 'Visualization']}
                />
            </div>
        );
    }
}

export default QuestionView;
