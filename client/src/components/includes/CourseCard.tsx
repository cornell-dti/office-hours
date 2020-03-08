import * as React from 'react';
import { Icon } from 'semantic-ui-react';

type Props = {
    course: FireCourse;
    // If not provided, it means that the student is not enrolled in the class yet.
    role?: FireCourseRole;
    onSelectCourse: (addCourse: boolean) => void;
    editable: boolean;
    selected: boolean;
};

class CourseCard extends React.Component<Props> {
    selectCourse = () => {
        const { role, onSelectCourse, editable, selected } = this.props;
        if (!editable) {
            this.redirect('/course/' + this.props.course.courseId);
            return;
        }
        if (role === undefined || role === 'student') {
            onSelectCourse(!selected);
        }
    };

    redirect = (href: string) => {
        document.location.href = href;
    };

    render() {
        let role = '';
        if (this.props.role === 'ta') {
            role = 'TA';
        } else if (this.props.role === 'professor') {
            role = 'PROF';
        }
        return (
            <div
                className={'CourseCard' + (this.props.selected ? ' selected' : '')}
                onClick={this.selectCourse}
            >
                <div className="courseText">
                    <div className="courseCode">
                        {this.props.course.code}
                        {role && <span className="role">{role}</span>}
                    </div>
                    <div className="courseName">
                        {this.props.course.name}
                    </div>
                </div>
                <div className="courseColor">
                    {this.props.editable && (
                        this.props.selected
                            ? <Icon className="icon" name="check" />
                            : <Icon className="icon" name="plus" />
                    )}
                </div>
            </div>
        );
    }
}

export default CourseCard;
