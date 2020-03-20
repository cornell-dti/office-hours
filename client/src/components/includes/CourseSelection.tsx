import * as React from 'react';
import TopBar from '../includes/TopBar';
import QMeLogo from '../../media/QLogo2.svg';
import CourseCard from '../includes/CourseCard';
import { firestore } from '../../firebase';


type Props = {
    readonly user: FireUser;
    readonly allCourses: readonly FireCourse[];
    readonly isEdit: boolean;
};

function CourseSelection({ user, isEdit, allCourses }: Props): React.ReactElement {
    const currentlyEnrolledCourseIds = new Set(user.courses);
    const [selectedCourses, setSelectedCourses] = React.useState<FireCourse[]>(
        allCourses.filter(
            ({ courseId }) => currentlyEnrolledCourseIds.has(courseId) && user.roles[courseId] === undefined
        )
    );
    const coursesToEnroll: string[] = [];
    const coursesToUnenroll: string[] = [];
    allCourses.forEach(({ courseId }) => {
        if (selectedCourses.some(selected => selected.courseId === courseId)) {
            // The course is selected.
            if (!currentlyEnrolledCourseIds.has(courseId)) {
                coursesToEnroll.push(courseId);
            }
            // Otherwise, it means that the course has already been enrolled. We just keep it.
        } else {
            // The course is not selected.
            if (!currentlyEnrolledCourseIds.has(courseId) || user.roles[courseId] !== undefined) {
                // Either
                // - Previously not enrolled, still not enrolled.
                // - Is a professor or a TA of the class. Cannot change by themselves.
                // We Do nothing.
                return;
            }
            // They are students in that class, legit to unenroll.
            coursesToUnenroll.push(courseId);
        }
    });

    const canSave = coursesToEnroll.length + coursesToUnenroll.length === 0;

    console.log({ coursesToEnroll, coursesToUnenroll, selectedCourses, user });

    const onSelectCourse = (course: FireCourse, addCourse: boolean) => {
        console.log({ course, addCourse });
        setSelectedCourses((previousSelectedCourses) => (
            addCourse
                ? [...previousSelectedCourses, course]
                : previousSelectedCourses.filter(c => c !== course)
        ));
    };

    const onSubmit = () => {
        const newCourseSet = new Set(currentlyEnrolledCourseIds);
        coursesToEnroll.forEach(courseId => newCourseSet.add(courseId));
        coursesToUnenroll.forEach(courseId => newCourseSet.delete(courseId));
        const userUpdate: Partial<FireUser> = { courses: Array.from(newCourseSet.values()) };
        firestore.collection('users').doc(user.userId).update(userUpdate);
    };

    const selectedCoursesString = selectedCourses.length === 0
        ? 'No Classes Chosen'
        : selectedCourses.map(c => c.code).join(', ');

    return (
        <div>
            <div className="CourseSelection">
                <img src={QMeLogo} className="QMeLogo course" alt="Queue Me In Logo" />
                <TopBar
                    user={user}
                    // Only used to distinguisg between prof and non-prof. Hardcoding student is OK.
                    role="student"
                    context="session"
                    // This field is only necessary for professors, but we are always student/TA here.
                    courseId="DUMMY_COURSE_ID"
                />
                <div className="selectionContent">
                    <div className="description">
                        <div className="title">
                            {isEdit ? 'Edit Your Classes' : 'My Classes'}
                        </div>
                        <div className="subtitle">
                            {isEdit ? 'Add or remove classes.' : 'Select the office hours you want to view.'}
                            <div className="EnrolledCourses mobile">{selectedCoursesString}</div>
                        </div>
                    </div>
                    <div className="CourseCards">
                        {allCourses.map((course) => {
                            const role = currentlyEnrolledCourseIds.has(course.courseId)
                                ? (user.roles[course.courseId] || 'student')
                                : undefined;
                            return (
                                <CourseCard
                                    key={course.courseId}
                                    course={course}
                                    role={role}
                                    onSelectCourse={(addCourse) => onSelectCourse(course, addCourse)}
                                    editable={isEdit}
                                    selected={selectedCourses.includes(course)
                                        || (role !== undefined && role !== 'student')}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
            {isEdit && (
                <div className="EnrollBar">
                    <div className="EnrolledCourses web">
                        {selectedCoursesString}
                    </div>
                    <div className="buttons">
                        <button className={'save' + (canSave ? ' disabled' : '')} onClick={onSubmit}>
                            Save
                        </button>
                        <button className="cancel" onClick={() => setSelectedCourses([])}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseSelection;
