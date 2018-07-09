import * as React from 'react';

import AddQuestion from '../includes/AddQuestion';

class QuestionView extends React.Component {
    props: {
        match: {
            params: {
                sessionId: number,
                courseId: number
            }
        }
    };

    render() {
        return (
            <div className="QuestionView">
                <AddQuestion
                    primaryTags={['Assignment', 'Lecture', 'Exam', 'General']}
                    secondaryTags={['Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4',
                        'Assignment 5', 'Assignment 6']}
                    primaryTagsIds={[1, 2, 3, 4]}
                    secondaryTagsIds={[5, 6, 7, 8, 9, 10]}
                    secondaryTagParentIds={[1, 1, 1, 1, 1, 1]}
                    sessionId={this.props.match.params.sessionId}
                    courseId={this.props.match.params.courseId}
                />
            </div>
        );
    }
}

export default QuestionView;
