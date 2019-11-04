import * as React from 'react';
import { Icon } from 'semantic-ui-react';

class CourseCard extends React.Component {
    props: {
        course: AppCourse,
        role: string,
        selectCourse?: Function, // If not provided, default to redirection to the course's page
        selected?: boolean
    };

    componentDidMount() {
        if (this.props.selectCourse && this.props.role !== 'student') {
            this.props.selectCourse(this.props.course, true);
        }
    }

    redirect = (href: string) => {
        document.location.href = href;
    }

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
                onClick={() => this.props.selectCourse ?
                    // Must not be a TA/Prof to be able to deselect a course
                    (this.props.role === 'student' &&
                        this.props.selectCourse(this.props.course, !this.props.selected)) :
                    this.redirect('/course/' + this.props.course.courseId)
                }
            >
                <div className="courseText">
                    <div className="courseCode">
                        {this.props.course.code}
                        {role !== '' && <span className="role">{role}</span>}
                    </div>
                    <div className="courseName">
                        {this.props.course.name}
                    </div>
                </div>
                <div className="courseColor">
                    {this.props.selected !== undefined &&
                        (this.props.selected ?
                            <Icon className="icon" name="check" /> :
                            <Icon className="icon" name="plus" />)
                    }
                </div>
            </div>
        );
    }
}

export default CourseCard;
