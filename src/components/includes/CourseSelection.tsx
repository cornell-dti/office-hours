import * as React from "react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router";

import { connect } from "react-redux";
import { Icon, Loader } from 'semantic-ui-react'
import TopBar from "./TopBar";
import CourseCard from "./CourseCard";
import { CURRENT_SEMESTER } from "../../constants";
import { updateCourses } from "../../firebasefunctions/courses";
import { RootState } from "../../redux/store";
import CourseCreatePopup from "./CourseCreatePopup";


type Props = {
    readonly user: FireUser;
    readonly allCourses: readonly FireCourse[];
    readonly allPendingCourses: readonly FireCourse[];
    readonly isEdit: boolean;
};

export type PageState = "ready" | "pending";

function CourseSelection({ user, isEdit, allCourses, allPendingCourses }: Props): React.ReactElement {
    const history = useHistory();
    const [isWritingChanges, setIsWritingChanges] = useState(false);
    const [, setPageState] = useState<PageState>("ready");

    // Normal editing mode (isNormalEditingMode=true) has all the controls.
    // On the contrary, onboarding (isNormalEditingMode=false) has only enroll button.
    const [isNormalEditingMode, setEditingMode] = useState<boolean>(user && user.courses.length > 0);

    const [currentCourses, setCurrentCourses] = useState<FireCourse[]>([]);
    const [formerCourses, setFormerCourses] = useState<FireCourse[]>([]);

    const [currentPendingCourses, setCurrentPendingCourses] = useState<FireCourse[]>([]);
    const [createCourseHover, setCreateCourseHover] = useState<boolean>(false);
    const [courseCreatePopup, setCourseCreatePopup] = useState(false);

    // current searched courses
    const [filteredCourses] = useState<FireCourse[]>(currentCourses);
    useEffect(() => {
        setCurrentlyEnrolledCourseIds(new Set(user?.courses));
    }, 
    // eslint-disable-next-line
    [user?.courses]);
    // need optional chaining in the dependency array because while logging 
    // out from the Course Selection page, user could be null.

    const filterOnActiveAndRole = React.useCallback(() => {
        return allCourses
            .filter((course) => course.semester === CURRENT_SEMESTER)
            .sort((a, b) => {
                const isUserTAorProfA = a.tas?.includes(user?.userId) || a.professors?.includes(user?.userId) ? 1 : 0;
                const isUserTAorProfB = b.tas?.includes(user?.userId) || b.professors?.includes(user?.userId) ? 1 : 0;
                return isUserTAorProfB - isUserTAorProfA; // Sort in descending order (1's before 0's)
            });
    }, 
    // eslint-disable-next-line
    [allCourses, user?.userId]);

    useEffect(() => {
        setCurrentCourses(filterOnActiveAndRole);

        setFormerCourses(
            
            allCourses.filter((course) => {
                return course.semester !== CURRENT_SEMESTER;
            })
        );

        setCurrentPendingCourses(
            allPendingCourses.filter((course) => {
                return course.semester === CURRENT_SEMESTER;
            })
            ,
        );
    }, [filterOnActiveAndRole, allCourses, allPendingCourses]);


    const [currentlyEnrolledCourseIds, setCurrentlyEnrolledCourseIds] = useState(new Set<string>());

    // Filter courses based on the current semester, reset the search results (when search term is deleted, etc)
    const availableCourses = filterOnActiveAndRole();

    useEffect(() => {
        setCurrentlyEnrolledCourseIds(new Set(user?.courses));
    }, 
    // eslint-disable-next-line
    [user?.courses]);

    const preSelectedCourses: FireCourse[] =
        user?.courses.length > 0 ? currentCourses.filter((course) => user.roles[course.courseId] !== undefined) : [];

    const [selectedCourses, setSelectedCourses] = useState<FireCourse[]>(preSelectedCourses);

    // courses in which role is defined (TA or Prof)
    const [unchangeableCourses, setUnchangableCourses] = useState<FireCourse[]>(preSelectedCourses);

    useEffect(() => {
        setSelectedCourses(
            currentCourses.filter(
                ({ courseId }) => currentlyEnrolledCourseIds.has(courseId) &&
                 user && user.roles[courseId] === undefined,
            ),
        );
        setUnchangableCourses(
            currentCourses.filter(
                ({ courseId }) => currentlyEnrolledCourseIds.has(courseId) && 
                user && user.roles[courseId] !== undefined,
            ),
        );
    }, [user, filteredCourses, currentlyEnrolledCourseIds, currentCourses]);

    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

    const coursesToEnroll: string[] = [];
    const coursesToUnenroll: string[] = [];
    let numCoursesWithRoles = 0;
    currentCourses.forEach(({ courseId }) => {
        if (selectedCourses.some((selected) => selected.courseId === courseId)) {
            // The course is selected.
            if (!currentlyEnrolledCourseIds.has(courseId)) {
                coursesToEnroll.push(courseId);
            }
            // Otherwise, it means that the course has already been enrolled. We just keep it.
        } else {
            // The course is not selected.
            if (!currentlyEnrolledCourseIds.has(courseId) || user?.roles[courseId] !== undefined) {
                // Either
                // - Previously not enrolled, still not enrolled.
                // - Is a professor or a TA of the class. Cannot change by themselves.
                if (user?.roles[courseId] === "professor" || user?.roles[courseId] === "ta") {
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
            setIsSaveDisabled(
                coursesToEnroll.length + coursesToUnenroll.length + numCoursesWithRoles === 0 && !isWritingChanges
            );
        } else {
            setIsSaveDisabled(coursesToEnroll.length + coursesToUnenroll.length === 0 && !isWritingChanges);
        }
        setPageState(isWritingChanges ? "pending" : "ready");
    }, [isWritingChanges, coursesToEnroll, coursesToUnenroll, isNormalEditingMode, numCoursesWithRoles]);

    useEffect(() => {
        setSelectedCourseIds(selectedCourses.map((course) => course.courseId));
    }, [selectedCourses]);

    // extra check if user is logged out
    if (!user) {
        return <Loader active={true} content={"Loading"} />;
    }

    const onSelectCourse = (course: FireCourse, addCourse: boolean) => {
        setSelectedCourses((previousSelectedCourses) =>
            addCourse
                ? [...previousSelectedCourses, course]
                : previousSelectedCourses.filter((c) => c.courseId !== course.courseId),
        );
    };

    /**
     * Handles the search functionality of the search bar in 'edit courses'. Is called
     * onChange of the input element of 'searchbar'.
     * Filters the current view of courses based on the search term, while preserving
     * the selected courses (shows preservation through list of courses selected under search bar).
     *
     * @param e = event to pass in search term
     */
    const searchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const search = e.target.value.toLowerCase();

        // Filter courses based on the search term
        const filteredResults = availableCourses.filter((course) => {
            return course.code.toLowerCase().includes(search) || course.name.toLowerCase().includes(search);
        });

        // Preserve the selected courses
        const updatedCourses = filteredResults.map((course) => {
            const isSelected = selectedCourseIds.includes(course.courseId);
            return {
                ...course,
                isSelected,
            };
        });

        setCurrentCourses(updatedCourses);
    };

    const onSubmit = () => {
        const newCourseSet = new Set(currentlyEnrolledCourseIds);
        coursesToEnroll.forEach((courseId) => newCourseSet.add(courseId));
        coursesToUnenroll.forEach((courseId) => newCourseSet.delete(courseId));
        const userUpdate: Partial<FireUser> = { courses: Array.from(newCourseSet.values()) };
        setIsWritingChanges(true);
        updateCourses(user.userId, userUpdate).then(() => {
            setIsWritingChanges(false);
            setEditingMode(user.courses.length > 0);
            history.push("/home");
            
        });
    };

    const onCancel = () => {
        // don't add newly-selected courses... add back the newly-deselected courses
        setSelectedCourses([
            ...selectedCourses.filter((course) => !coursesToEnroll.includes(course.courseId)),
            ...currentCourses.filter((course) => coursesToUnenroll.includes(course.courseId)),
        ]);

        history.push("/home");
    };


    // changed guard from selectedCourses.length + numCoursesWithRoles === 0 to selectedCourses.length === 0
    //  so that when you cannot unenroll from a course, it says No Classes Chosen instead of an empty box
    const selectedCoursesString = selectedCourses.length === 0 ? "" : selectedCourses.map((c) => c.code).join(", ");
    const hasCurrentCourse =
        currentCourses
            .map((course) => course.professors)
            .flat()
            .includes(user.userId) ||
        currentCourses
            .map((course) => course.tas)
            .flat()
            .includes(user.userId);

    const hasCurrentPendingCourse =
        currentPendingCourses
            .map((course) => course.professors)
            .flat()
            .includes(user.userId) ||
        currentPendingCourses
            .map((course) => course.tas)
            .flat()
            .includes(user.userId);
        


    /* eslint-disable max-len */
    return (
        <div>
            <div className="CourseSelection">
                <TopBar
                    // Only used to distinguish between prof and non-prof. Hardcoding student is OK.
                    role="student"
                    context="session"
                    // This field is only necessary for professors, but we are always student/TA here.
                    courseId="DUMMY_COURSE_ID"
                />
                <div className="GreyBackground">
                    <div className="WhiteBackground">
                        <div className="selectionContent">
                            <div className="description">
                                <div className="sideblock">
                                    <div className="title">
                                        {isEdit ? <div> Edit Your Classes </div> : "My Classes"}
                                    </div>
                                    <div className="subtitle">
                                        {isEdit
                                            ? "Add or remove classes of your selection."
                                            : (currentCourses.length > 0 ? "Select the office hours you want to view.": "You are not enrolled in any courses. Click 'Edit' to enroll in courses.")}
                                        <div className="EnrolledCourses mobile">{selectedCoursesString}</div>
                                    </div>
                                </div>
                                <div className="sideblock searchbar">
                                    <input
                                        type="text"
                                        placeholder="Search for class name or number..."
                                        onChange={searchInput}
                                        size={2}
                                    />
                                    <div className="searchIcon">
                                        <Icon className="icon" color="grey" name="search" />
                                    </div>
                                </div>
                            </div>
                            <hr className="sectionDivide" />
                            {isEdit && (selectedCoursesString.length > 0 || unchangeableCourses.length > 0) ? (
                                <div className="EnrolledClasses">
                                    {unchangeableCourses.map((course) => course.code).join(", ")}
                                    {selectedCoursesString.length > 0 && unchangeableCourses.length > 0
                                        ? ", "
                                        : ""}
                                    {selectedCoursesString}
                                </div>
                            ) : (
                                <div />
                            )}
                            <div className="CourseCards">
                                {currentCourses
                                    .filter(
                                        (course) =>
                                            selectedCourseIds.includes(course.courseId) ||
                                                    currentlyEnrolledCourseIds.has(course.courseId) ||
                                                    isEdit,
                                    )
                                    .map((course) => {
                                        const role = currentlyEnrolledCourseIds.has(course.courseId) 
                                                && user
                                            ? user.roles[course.courseId] || "student"
                                            : undefined;
                                        const selected =
                                                    selectedCourseIds.includes(course.courseId) ||
                                                    (role !== undefined && role !== "student");
                                        return (
                                            <div key={course.courseId}>
                                                <CourseCard
                                                    course={course}
                                                    role={role}
                                                    onSelectCourse={(addCourse) =>
                                                        onSelectCourse(course, addCourse)
                                                    }
                                                    editable={isEdit}
                                                    selected={selected}
                                                />
                                            </div>
                                        );
                                    })}
                            </div>
                            
                            {!isEdit &&
                            formerCourses.filter(
                                (course) =>
                                    selectedCourseIds.includes(course.courseId) ||
                                    currentlyEnrolledCourseIds.has(course.courseId),
                            ).length > 0 ? (
                                    <>
                                        <div className="description">
                                            <div className="title" style={{ paddingTop: "30px" }}>
                                            Former Classes
                                            </div>
                                        </div>
                                        <hr className="sectionDivide" />
                                        <div className="CourseCards CourseCardsInactive">
                                            {formerCourses
                                                .filter(
                                                    (course) =>
                                                        selectedCourseIds.includes(course.courseId) ||
                                                    currentlyEnrolledCourseIds.has(course.courseId),
                                                )
                                                .map((course, index) => {
                                                    const role = currentlyEnrolledCourseIds.has(course.courseId)
                                                    && user
                                                        ? user.roles[course.courseId] || "student"
                                                        : undefined;
                                                    return (
                                                        <div key={index}>
                                                            <CourseCard
                                                                key={course.courseId}
                                                                course={course}
                                                                role={role}
                                                                inactive={true}
                                                                onSelectCourse={() => {}}
                                                                editable={false}
                                                                selected={false}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </>
                                ) : (
                                    <></>
                                )}
                        </div>
                    </div>
                </div>

                {/* Course creation submitted popup shows after submitting request or when hovering on disabled button. */}
                {(createCourseHover && hasCurrentPendingCourse && 
                            <div className="createCourseHover">
                                <Icon link name="close" className="close" onClick={() => setCreateCourseHover(false)} />
                                <h1>New Class Sent</h1>
                                <p>Your submission is pending to be reviewed by the team.</p>
                            </div>
                )}
                
                <div className="EnrollBar">
                    <div className="EnrolledCourses web">
                       
                        {Object.keys(user.roles).length > 0 && (<button
                            type="button"
                            className={
                                "createNewCourseButton" + (hasCurrentCourse || hasCurrentPendingCourse ? " disabled" : "")
                            }
                            disabled={hasCurrentCourse || hasCurrentPendingCourse}
                            onMouseOver={() => setCreateCourseHover(hasCurrentPendingCourse)}
                            onMouseOut={() => setCreateCourseHover(false)}
                            //Include these for accessibility
                            onFocus={() => setCreateCourseHover(hasCurrentPendingCourse)}
                            onBlur={() => setCreateCourseHover(false)}
                            onClick={() => setCourseCreatePopup(true)}
                        >
                        Create a Class
                        </button>
                        )}
                    </div>
                    <div className="buttons">
                        {!isEdit && (
                            <button
                                type="button"
                                className="switch"
                                onClick={() => {
                                    history.push("/edit");
                                }}
                            >
                                Edit
                            </button>
                        )}
                        {isEdit && (
                            <button
                                type="button"
                                className={"save" + (isSaveDisabled ? " disabled" : "")}
                                disabled={isSaveDisabled}
                                onClick={onSubmit}
                            >
                                {isNormalEditingMode ? "Save" : "Enroll"}
                            </button>
                        )}
                        {isEdit && isNormalEditingMode && (
                            <button type="button" className={"cancel"} onClick={onCancel}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {courseCreatePopup && (
                <CourseCreatePopup setCourseCreatePopup={setCourseCreatePopup} setCourseCreateHover={setCreateCourseHover} userId={user.userId} />
            )}
        </div>
    );
}
const mapStateToProps = (state: RootState) => ({
    user: state.auth.user,
});

export default connect(mapStateToProps, {})(CourseSelection);
