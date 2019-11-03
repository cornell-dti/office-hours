import * as React from 'react';
import CourseSelection from '../includes/CourseSelection';

class CourseSelectionView extends React.Component {

    render() {
        return (
            <div className="CourseEditView">
                <CourseSelection
                    isEdit={false}
                />
            </div>
        );
    }
}

export default CourseSelectionView;
