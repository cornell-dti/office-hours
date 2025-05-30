import * as React from "react";
import { useHistory } from "react-router";
import { Icon } from "semantic-ui-react";
import { Grid } from "@material-ui/core";

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
                history.push("/course/" + course.courseId);
            }
            return;
        }
        if (role === undefined || role === "student") {
            onSelectCourse(!selected);
        }
    };

    let roleString = "";

    if (role === "ta") {
        roleString = "TA";
    } else if (role === "professor") {
        roleString = "PROF";
    }

    return (
        <div
            className={`CourseCard ${selected && editable ? "selected" : ""} ${inactive ? "inactive" : "active"} 
            ${role === "ta" || role === "professor" ? "ineditable" : "editable"}`}
            onClick={selectCourse}
        >
            <Grid container direction="row" justifyContent="space-between" style={{ height: "58px" }}>
                {roleString ? (
                    <Grid container item className="courseColor" xs={6}>
                        <span
                            className="courseRole"
                            style={{
                                border: `2px solid ${role === "ta" ? "var(--role-color-ta)" : 
                                    role === "professor" ? "var(--role-color-professor)" : "transparent"}`,
                                color: role === "ta" ? "var(--role-color-ta)" : 
                                    role === "professor" ? "var(--role-color-professor)" : "inherit",
                            }}
                        >
                            {role === "ta" ? "TA" : role === "professor" ? "PROF" : ""}
                        </span>{" "}
                    </Grid>
                ) : (
                    <Grid container item className="courseColor" xs={6} />
                )}
                {roleString === "" && !inactive && ( // use && instead of empty components <><>, same behavior 
                    <div>
                        {editable ? (
                            <Grid container item xs={6} justify-self="end">
                                <div className="courseColor">
                                    {selected ? (
                                        <Icon className="icon" fill="#77BBFA" color="blue" name="check circle" />
                                    ) : (
                                        <Icon className="icon" color="grey" name="circle outline" />
                                    )}
                                </div>
                            </Grid>
                        ) : (
                            <Grid container item xs={6} justify-self="end" />
                        )}
                    </div>
                )}
            </Grid>
            <div className="courseText">
                <div className="courseCode">{course.code}</div>
                <div className="courseName">
                    {course.name.length > 30 ? course.name.substring(0, 27) + "..." : course.name}
                </div>
            </div>

            {!inactive && !editable ? (
                <div className="myClasses">
                    <div className="myClassesText">Go to course</div>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};

CourseCard.defaultProps = {
    role: undefined,
    inactive: false,
};

export default CourseCard;
