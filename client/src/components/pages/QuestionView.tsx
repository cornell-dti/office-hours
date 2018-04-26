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
                    taName="Sangwoo Kim"
                    taPicture={imageURL}
                    primaryTags={['Assignment', 'Lecture', 'Exam', 'General']}
                    secondaryTags={['Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4',
                        'Assignment 5', 'Assignment 6']}
                    primaryTagsIds={[1, 2, 3, 4]}
                    secondaryTagsIds={[5, 6, 7, 8, 9, 10]}
                    secondaryTagParentIds={[1, 1, 1, 1, 1, 1]}
                />
            </div>
        );
    }
}

export default QuestionView;
