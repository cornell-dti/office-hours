import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import TopBar from './TopBar';
import CourseCard from './CourseCard';
import { firestore } from '../../firebase';
import { CURRENT_SEMESTER } from '../../constants';
import { updateCourses } from '../../firebasefunctions/courses';

type Props = {
    readonly user: FireUser;
    readonly allCourses: readonly FireCourse[];
    readonly isEdit: boolean;
};

export type PageState = 'ready' | 'pending';

function CourseSelection({ user, isEdit, allCourses }: Props): React.ReactElement {
    const history = useHistory();
    const [isWritingChanges, setIsWritingChanges] = useState(false);
    const [, setPageState] = useState<PageState>('ready');

    // Normal editing mode (isNormalEditingMode=true) has all the controls.
    // On the contrary, onboarding (isNormalEditingMode=false) has only enroll button.
    const [isNormalEditingMode, setEditingMode] = useState<boolean>(user.courses.length > 0);

    const [currentCourses, setCurrentCourses] = useState<FireCourse[]>([]);
    const [formerCourses, setFormerCourses] = useState<FireCourse[]>([]);

    useEffect(() => {
        setCurrentCourses(allCourses.filter((course) => {
            return course.semester === CURRENT_SEMESTER;
        }));

        setFormerCourses(allCourses.filter((course) => {
            return course.semester !== CURRENT_SEMESTER;
        }));
    }, [allCourses]);

    const [currentlyEnrolledCourseIds, setCurrentlyEnrolledCourseIds] = useState(new Set<string>());

    useEffect(() => {
        setCurrentlyEnrolledCourseIds(new Set(user.courses));
    }, [user.courses]);

    const [selectedCourses, setSelectedCourses] = useState<FireCourse[]>([]);

    useEffect(() => {
        setSelectedCourses(currentCourses.filter(
            ({ courseId }) => currentlyEnrolledCourseIds.has(courseId) && user.roles[courseId] === undefined
        ));
    }, [user, currentCourses, currentlyEnrolledCourseIds]);

    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

    const coursesToEnroll: string[] = [];
    const coursesToUnenroll: string[] = [];
    let numCoursesWithRoles = 0;
    currentCourses.forEach(({ courseId }) => {
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
                if (user.roles[courseId] === 'professor' || user.roles[courseId] === 'ta') {
                    numCoursesWithRoles += 1;
                }
                // We Do nothing.
                return;
            }
            // They are students in that class, legit to unenroll.
            coursesToUnenroll.push(courseId);
        }
    });

    const [isSaveDisabled, setIsSaveDisabled] = useState(false);

    useEffect(() => {
        if (!isNormalEditingMode) {
            setIsSaveDisabled((
                coursesToEnroll.length + coursesToUnenroll.length + numCoursesWithRoles === 0)
                && !isWritingChanges);
        } else {
            setIsSaveDisabled((coursesToEnroll.length + coursesToUnenroll.length === 0) && !isWritingChanges);
        }
        setPageState(isWritingChanges ? 'pending' : 'ready');
    }, [isWritingChanges, coursesToEnroll, coursesToUnenroll, isNormalEditingMode, numCoursesWithRoles]);

    useEffect(() => {
        setSelectedCourseIds(selectedCourses.map(course => course.courseId));
    }, [selectedCourses]);

    const onSelectCourse = (course: FireCourse, addCourse: boolean) => {
        setSelectedCourses((previousSelectedCourses) => (
            addCourse
                ? [...previousSelectedCourses, course]
                : previousSelectedCourses.filter(c => c.courseId !== course.courseId)
        ));
    };

    const onSubmit = () => {
        const newCourseSet = new Set(currentlyEnrolledCourseIds);
        coursesToEnroll.forEach(courseId => newCourseSet.add(courseId));
        coursesToUnenroll.forEach(courseId => newCourseSet.delete(courseId));
        const userUpdate: Partial<FireUser> = { courses: Array.from(newCourseSet.values()) };
        setIsWritingChanges(true);
        updateCourses(user.userId, userUpdate).then(() => {
            history.push('/home');
            setIsWritingChanges(false);
            setEditingMode(user.courses.length > 0);
        });
    };

    const onCancel = () => {
        // don't add newly-selected courses... add back the newly-deselected courses
        setSelectedCourses([
            ...(selectedCourses.filter(course => !coursesToEnroll.includes(course.courseId))),
            ...currentCourses.filter(course => coursesToUnenroll.includes(course.courseId))
        ]);

        history.push('/home');
    };

    const selectedCoursesString = (selectedCourses.length + numCoursesWithRoles === 0
        ? 'No Classes Chosen'
        : selectedCourses.map(c => c.code).join(', '));

    return (
        <div>
            <div className="CourseSelection">
                <TopBar
                    user={user}
                    // Only used to distinguish between prof and non-prof. Hardcoding student is OK.
                    role="student"
                    context="session"
                    // This field is only necessary for professors, but we are always student/TA here.
                    courseId="DUMMY_COURSE_ID"
                />
                <div className="selectionContent">
                    {currentCourses.length > 0 || isEdit ?
                        <>
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
                                {currentCourses.filter(course => selectedCourseIds.includes(course.courseId) ||
                            currentlyEnrolledCourseIds.has(course.courseId)
                            || isEdit)
                                    .map((course) => {
                                        const role = currentlyEnrolledCourseIds.has(course.courseId)
                                            ? (user.roles[course.courseId] || 'student')
                                            : undefined;
                                        const selected = selectedCourseIds.includes(course.courseId)
                                    || (role !== undefined && role !== 'student');
                                        return (
                                            <div key={course.courseId}>
                                                <CourseCard
                                                    course={course}
                                                    role={role}
                                                    onSelectCourse={(addCourse) => onSelectCourse(course, addCourse)}
                                                    editable={isEdit}
                                                    selected={selected}
                                                />
                                            </div>
                                        );
                                    })}
                            </div>
                        </>
                        : <><div className="description">
                            <div className="title">
                                {'My Classes'}
                            </div>
                            <div className="subtitle">
                                {"You are not enrolled in any courses. Click 'Edit' to enroll in courses."}
                            </div>
                        </div></>}
                    {!isEdit && formerCourses.length > 0 ? <>
                        <div className="description">
                            <div className="subtitle">
                                Former Classes
                            </div>
                        </div>
                        <div className="CourseCards CourseCardsInactive">
                            {formerCourses.filter(course => selectedCourseIds.includes(course.courseId) ||
                                currentlyEnrolledCourseIds.has(course.courseId))
                                .map((course) => {
                                    const role = currentlyEnrolledCourseIds.has(course.courseId)
                                        ? (user.roles[course.courseId] || 'student')
                                        : undefined;
                                    return (
                                        <div>
                                            <CourseCard
                                                key={course.courseId}
                                                course={course}
                                                role={role}
                                                inactive={true}
                                                onSelectCourse={() => { }}
                                                editable={false}
                                                selected={false}
                                            />
                                        </div>
                                    );
                                })}
                        </div>
                    </> : <></>}
                </div>
            </div>
            <div className="EnrollBar">
                <div className="EnrolledCourses web">
                    {isEdit && selectedCoursesString}
                </div>
                <div className="buttons">
                    {!isEdit && (
                        <button type="button" className="switch" onClick={() => { history.push('/edit'); }}>
                            Edit
                        </button>
                    )}
                    {isEdit && (
                        <button
                            type="button"
                            className={'save' + (isSaveDisabled ? ' disabled' : '')}
                            disabled={isSaveDisabled}
                            onClick={onSubmit}
                        >
                            {isNormalEditingMode ? 'Save' : 'Enroll'}
                        </button>
                    )}
                    {isEdit && isNormalEditingMode && (
                        <button type="button" className={'cancel'} onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CourseSelection;
