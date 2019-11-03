import * as React from 'react';
import { Icon } from 'semantic-ui-react';

class CourseCard extends React.Component {
    props: {
        course: AppCourse,
        selectCourse?: Function, // If not provided, default to redirection to the course's page
        selected?: boolean
    };

    redirect = (href: string) => {
        document.location.href = href;
    }

    render() {
        return (
            <div
                className={'CourseCard' + (this.props.selected ? ' selected' : '')}
                onClick={() => this.props.selectCourse ?
                    this.props.selectCourse(this.props.course, !this.props.selected) :
                    this.redirect('/course/' + this.props.course.courseId)
                }
            >
                <div className="courseText">
                    <div className="courseCode">
                        {this.props.course.code}
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
