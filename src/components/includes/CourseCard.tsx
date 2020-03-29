import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import { useHistory } from 'react-router';

type Props = {
    course: FireCourse;
    // If not provided, it means that the student is not enrolled in the class yet.
    role?: FireCourseRole;
    onSelectCourse: (addCourse: boolean) => void;
    editable: boolean;
    selected: boolean;
};

const CourseCard = ({ course, role, onSelectCourse, editable, selected }: Props) => {
    const history = useHistory();

    const selectCourse = () => {
        if (!editable) {
            history.push('/course/' + course.courseId);
            return;
        }
        if (role === undefined || role === 'student') {
            onSelectCourse(!selected);
        }
    };

    let roleString = '';
    if (role === 'ta') {
        roleString = 'TA';
    } else if (role === 'professor') {
        roleString = 'PROF';
    }
    return (
        <div
            className={'CourseCard' + (selected ? ' selected' : '')}
            onClick={selectCourse}
        >
            <div className="courseText">
                <div className="courseCode">
                    {course.code}
                    {roleString && <span className="role">{roleString}</span>}
                </div>
                <div className="courseName">
                    {course.name}
                </div>
            </div>
            <div className="courseColor">
                {editable ? (
                    selected
                        ? <Icon className="icon" name="check" />
                        : <Icon className="icon" name="plus" />
                ) : (
                        <div>
                            Go to course
                        </div>
                    )}
            </div>
        </div>
    );
};

export default CourseCard;
