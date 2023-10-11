import * as React from "react";
import "./CourseCreatePopup.scss";
import { useState } from "react";
import { Icon } from "semantic-ui-react";

import CreateCourseImg from "../../media/createCourseImage.png";

//CiSquarePlus
const CourseCreatePopup = ({ setCourseCreatePopup }: any) => {
    const [courseCreatePopupContinue, setCourseCreatePopupContinue] = useState(false);

    const handleTextField = (
        event: React.ChangeEvent<HTMLElement>,
        setStateFunction: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const target = event.target as HTMLTextAreaElement;
        setStateFunction(target.value);
    };

    const [courseCode, setCourseCode] = useState("");
    const [courseName, setCourseName] = useState("");

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
                        <input type="radio" id="professor" name="fav_language" value="HTML" />
                        <p>TA</p>
                        <input type="radio" id="ta" name="fav_language" value="HTML" />
                    </div>
                    <label htmlFor="course_code" className="input_component">
                        {" "}
                        Course Code*
                        <input
                            id="course_code"
                            type="text"
                            value={courseCode || ""}
                            placeholder="E.g. CS 1110 (including a space)"
                            onChange={(e) => handleTextField(e, setCourseCode)}
                        />
                        <p />
                    </label>
                    <label htmlFor="course_code" className="input_component">
                        {" "}
                        Course Name*
                        <input
                            id="course_name"
                            type="text"
                            value={courseName || ""}
                            placeholder="E.g. Introduction to Computing Using Python"
                            onChange={(e) => handleTextField(e, setCourseName)}
                        />
                    </label>
                    <div className="dropdownSection">
                        <label htmlFor="year" className="input_component">
                            {" "}
                            Year*
                            <select id="year">
                                <option value="value">2023</option>
                                <option value="value">2024</option>
                                <option value="value">2025</option>
                            </select>
                        </label>
                        <label htmlFor="term" className="input_component">
                            {" "}
                            Term*
                            <select id="term">
                                <option value="value">Spring</option>
                                <option value="value">Fall</option>
                            </select>
                        </label>
                    </div>
                </form>
                <button type="button" className="submit" onClick={() => setCourseCreatePopup(false)}>
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
