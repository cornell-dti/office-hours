import * as React from 'react';
import { useHistory } from 'react-router';
import { Icon } from 'semantic-ui-react';

type Props = {
    course: FireCourse;
    // If not provided, it means that the student is not enrolled in the class yet.
    role?: FireCourseRole;
    onSelectCourse: (addCourse: boolean) => void;
    editable: boolean;
    selected: boolean;
    inactive?: boolean;
};
/**
 * Renders a course card to display in the course selection page. Displays course code, name, and role if applicable.
 * @param course: the course to be displayed
 * @param role: the role of the user in the course
 * @param onSelectCourse: function to call when the course is selected
 * @param editable: whether the course card is editable (ex if you are a ta, you cannot unselect the course)
 * @param selected: whether the course is selected
 * @param inactive: whether the course is inactive for the current semester
 * @returns rendered CourseCard component
 */
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
                <div>
                    {editable ? (
                        
                        <div className="courseColor"> {selected ? (
                            <Icon className="icon" fill="#77BBFA" color="blue" name="check circle" />
                        ) : (
                            <Icon className="icon" name="circle outline" />
                        )} </div>
                    ) : (
                        <div className="myClasses">Go to course</div>
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
