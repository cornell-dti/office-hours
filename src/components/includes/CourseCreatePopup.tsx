import * as React from "react";
import "./CourseCreatePopup.scss";
import { useState } from "react";
import { Icon } from "semantic-ui-react";
import firebase from "firebase/app";
import { CURRENT_SEMESTER, START_DATE, END_DATE } from "../../constants";
import { addPendingCourse } from "../../firebasefunctions/courses";
import CreateCourseImg from "../../media/createCourseImage.png";

const startDate = new Date(START_DATE);
const endDate = new Date(END_DATE);
const currentTerm = CURRENT_SEMESTER.substring(0, 2);
const currentYear = CURRENT_SEMESTER.substring(2, 4);

type Props = {
    setCourseCreatePopup: any;
    userId: string;
};

const CourseCreatePopup = ({ setCourseCreatePopup, userId }: Props) => {
    const [courseCreatePopupContinue, setCourseCreatePopupContinue] = useState(false);

    const [isProf, setIsProf] = useState(true);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [year, setYear] = useState(currentYear);
    const [term, setTerm] = useState(currentTerm);

    const handleTextField = (
        event: React.ChangeEvent<HTMLElement>,
        setStateFunction: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const target = event.target as HTMLTextAreaElement;
        setStateFunction(target.value);
    };

    const handleSelect = (
        event: React.ChangeEvent<HTMLElement>,
        setStateFunction: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const target = event.target as HTMLSelectElement;
        setStateFunction(target.value);
    };

    const createPendingCourse = async () => {
        setCourseCreatePopup(false);

        const semester = term + year;

        if (semester === CURRENT_SEMESTER) {
            const courseId = (code + "-" + term + "-" + year).replace(/\s/g, "").toLowerCase();
            const professors = isProf ? [userId] : [];
            const tas = !isProf ? [userId] : [];

            const course = {
                code,
                endDate: firebase.firestore.Timestamp.fromDate(endDate),
                name,
                queueOpenInterval: 30,
                semester: CURRENT_SEMESTER,
                startDate: firebase.firestore.Timestamp.fromDate(startDate),
                professors,
                tas,
                courseId,
                charLimit: 140,
                term,
                year,
            };

            try {
                await addPendingCourse(courseId, course);
            } catch (error) {
                // TODO: Handle error
            }
        } else {
            // TODO: Handle not adding courses for not the current semester
        }
    };

    return courseCreatePopupContinue ? (
        <div className="courseCreatePopupBackground">
            <div className="createCoursePopupContinueContainer">
                <Icon link name="close" onClick={() => setCourseCreatePopup(false)} />
                <img className="createCourseImg" src={CreateCourseImg} alt="logo" />
                <form className="inputs">
                    <h1>Create a New Class</h1>
                    <div className="role_input">
                        <p>I'm a...*</p>
                        <p>Professor</p>
                        <input
                            type="radio"
                            id="professor"
                            name="fav_language"
                            value="HTML"
                            onClick={() => setIsProf(true)}
                        />
                        <p>TA</p>
                        <input type="radio" id="ta" name="fav_language" value="HTML" onClick={() => setIsProf(false)} />
                    </div>
                    <label htmlFor="course_code" className="input_component">
                        {" "}
                        Course Code*
                        <input
                            id="course_code"
                            type="text"
                            value={code || ""}
                            placeholder="E.g. CS 1110 (including a space)"
                            onChange={(e) => handleTextField(e, setCode)}
                        />
                        <p />
                    </label>
                    <label htmlFor="course_code" className="input_component">
                        {" "}
                        Course Name*
                        <input
                            id="course_name"
                            type="text"
                            value={name || ""}
                            placeholder="E.g. Introduction to Computing Using Python"
                            onChange={(e) => handleTextField(e, setName)}
                        />
                    </label>
                    <div className="dropdownSection">
                        <label htmlFor="year" className="input_component">
                            {" "}
                            Year*
                            <select id="year" value={year} onChange={(e) => handleSelect(e, setYear)}>
                                <option value="23">2023</option>
                                <option value="24">2024</option>
                                <option value="25">2025</option>
                            </select>
                        </label>
                        <label htmlFor="term" className="input_component">
                            {" "}
                            Term*
                            <select id="term" value={term} onChange={(e) => handleSelect(e, setTerm)}>
                                <option value="SP">Spring</option>
                                <option value="FA">Fall</option>
                            </select>
                        </label>
                    </div>
                </form>
                <button type="button" className="submit" onClick={createPendingCourse}>
                    Submit
                </button>
            </div>
        </div>
    ) : (
        <>
            <div className="courseCreatePopupBackground">
                <div className="createCoursePopupContainer">
                    <Icon link name="close" onClick={() => setCourseCreatePopup(false)} />
                    <div className="createNewClassHeader">
                        <img className="createCourseImg" src={CreateCourseImg} alt="logo" />
                        <h1>Welcome to Create a New Class!</h1>
                    </div>
                    <p>
                        Please proceed only if you are a professor or authorized TA. The QMI team will verify your
                        submission.
                    </p>
                    <div className="buttons">
                        <button type="button" className="cancel" onClick={() => setCourseCreatePopup(false)}>
                            Cancel
                        </button>
                        <button type="button" className="continue" onClick={() => setCourseCreatePopupContinue(true)}>
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CourseCreatePopup;
