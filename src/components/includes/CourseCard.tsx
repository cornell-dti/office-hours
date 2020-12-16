import * as React from 'react';
import { useHistory } from 'react-router';
import { Icon } from 'semantic-ui-react';

import AccessibleButton from './AccessibleButton';

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

    const selectCourse = React.useCallback(() => {
        if (!editable) {
            if (!inactive) history.push('/course/' + course.courseId);
            return;
        }
        if (role === undefined || role === 'student') {
            onSelectCourse(!selected);
        }
    }, [editable, history, role, onSelectCourse, course.courseId, selected, inactive]);

    let roleString = '';
    if (role === 'ta') {
        roleString = 'TA';
    } else if (role === 'professor') {
        roleString = 'PROF';
    }
    return (
        <AccessibleButton
            className={`CourseCard ${selected && editable ? 'selected' : ''} ${inactive ? 'inactive' : 'active'}`}
            onInteract={selectCourse}
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
            {
                !inactive ?

                    <div className="courseColor">
                        {editable ? (
                            selected
                                ? <Icon className="icon" name="check" />
                                : <Icon className="icon" name="plus" />
                        ) : (<div>
                            Go to course
                        </div>)
                        }
                    </div> :
                    <></>
            }
        </AccessibleButton>
    );
};

export default CourseCard;
