import * as React from 'react';
import CourseSelection from '../includes/CourseSelection';

class CourseEditView extends React.Component {

    render() {
        return (
            <div className="CourseEditView">
                <CourseSelection
                    isEdit={true}
                />
            </div>
        );
    }
}

export default CourseEditView;
