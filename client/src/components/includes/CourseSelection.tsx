import * as React from 'react';
import TopBar from '../includes/TopBar';
import QMeLogo from '../../media/QLogo2.svg';
import CourseCard from '../includes/CourseCard';
import { firestore } from '../../firebase';

type Props = {
    readonly user: FireUser;
    readonly allCourses: readonly FireCourse[];
    readonly myCourseUsers: readonly FireCourseUser[];
    readonly isEdit: boolean;
};

function CourseSelection({ user, isEdit, allCourses, myCourseUsers }: Props): React.ReactElement {
    const [selectedCourses, setSelectedCourses] = React.useState<FireCourse[]>(
        allCourses.filter(course => {
            const correspondingCourseUser = myCourseUsers.find(user => user.courseId === course.courseId);
            return correspondingCourseUser !== undefined && correspondingCourseUser.role === 'student';
        })
    );
    const coursesToEnroll: FireCourse[] = [];
    const courseUserIdsOfCoursesToUnenroll: string[] = [];
    allCourses.forEach(course => {
        const correspondingCourseUser = myCourseUsers.find(user => user.courseId === course.courseId);
        if (selectedCourses.some(selected => selected.courseId === course.courseId)) {
            // The course is selected.
            if (correspondingCourseUser === undefined) {
                coursesToEnroll.push(course);
            } else if (correspondingCourseUser.role !== 'student') {
                throw new Error('Something is wrong with our input validation. '
                    + 'Users should not be able to select classes that they are TAing.'
                    + `Bad course: ${course}, bad role: ${correspondingCourseUser.role}`);
            }
            // Otherwise, it means that the course has already been enrolled. We just keep it.
        } else {
            // The course is not selected.
            if (!correspondingCourseUser || correspondingCourseUser.role !== 'student') {
                // Either
                // - Previously not enrolled, still not enrolled.
                // - Is a professor or a TA of the class. Cannot change by themselves.
                // We Do nothing.
                return;
            }
            // They are students in that class, legit to unenroll.
            courseUserIdsOfCoursesToUnenroll.push(correspondingCourseUser.courseUserId);
        }
    });

    const canSave = coursesToEnroll.length + courseUserIdsOfCoursesToUnenroll.length === 0;

    const onSelectCourse = (course: FireCourse, addCourse: boolean) => {
        setSelectedCourses((previousSelectedCourses) => (
            addCourse
                ? [...previousSelectedCourses, course]
                : previousSelectedCourses.filter(c => c !== course)
        ));
    };

    const onSubmit = () => {
        const batch = firestore.batch();
        coursesToEnroll.forEach(course => {
            const document: Omit<FireCourseUser, 'courseUserId'> = {
                userId: user.userId,
                courseId: course.courseId,
                role: 'student'
            };
            batch.set(firestore.collection('courseUsers').doc(), document);
        });
        courseUserIdsOfCoursesToUnenroll.forEach(courseUserId => {
            batch.delete(firestore.collection('courseUsers').doc(courseUserId));
        });
        batch.commit();
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
                            const relevantCourseUser = myCourseUsers.find(user => user.courseId === course.courseId);
                            const role = relevantCourseUser && relevantCourseUser.role;
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
