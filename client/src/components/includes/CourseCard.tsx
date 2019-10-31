import * as React from 'react';
import { Icon } from 'semantic-ui-react';

class CourseCard extends React.Component {
    props: {
        course: AppCourse,
        onClick?: Function
    };

    render() {
        return (
            <div className="CourseCard">
                <div className="courseText">
                    <div className="courseCode">
                        {this.props.course.code}
                    </div>
                    <div className="courseName">
                        {this.props.course.name}
                    </div>
                </div>
                <div className="courseColor">
                    <Icon className="icon" name="plus" />
                </div>
            </div>
        );
    }
}

export default CourseCard;
