import * as React from 'react';
import { useHistory } from 'react-router';
import { Icon } from 'semantic-ui-react';
import TickCircle from '../../media/TickCircle.svg';

type Props = {
    course: FireCourse;
    // If not provided, it means that the student is not enrolled in the class yet.
    role?: FireCourseRole;
    onSelectCourse: (addCourse: boolean) => void;
    editable: boolean;
    selected: boolean;
    inactive?: boolean;
};

const CourseCard = ({ course, role, onSelectCourse, editable, selected, inactive = false }: Props) => {
    const history = useHistory();

    const selectCourse = () => {
        if (!editable) {
            if (!inactive) {
                history.push('/course/' + course.courseId);
            }
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
            className={`CourseCard ${selected && editable ? 'selected' : ''} ${inactive ? 'inactive' : 'active'
                }`}
            onClick={selectCourse}
        >
            {!inactive ? (
                <div className="courseColor">
                    {editable ? (
                        selected ? (
                            <Icon className="icon" fill="#77BBFA" name="check circle" />
                        ) : (
                            <Icon className="icon" name="circle outline" />
                        )
                    ) : (
                        <div>Go to course</div>
                    )}
                </div>
            ) : (
                <></>
            )}
            <div className="courseText">
                <div className="courseCode">
                    {course.code}
                    {roleString && <span className="role">{roleString}</span>}
                </div>
                <div className="courseName">{course.name}</div>
            </div>

        </div>
    );
};

CourseCard.defaultProps = {
    role: undefined,
    inactive: false,
};

export default CourseCard;
