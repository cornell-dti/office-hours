import * as React from "react";
import "./CourseCreatePopup.scss";
import { useState } from "react";
import { Icon } from "semantic-ui-react";
import firebase from "firebase/app";
import { CURRENT_SEMESTER, START_DATE, END_DATE } from "../../constants";
import { addPendingCourse } from "../../firebasefunctions/courses";
import CreateCourseImg from "../../media/createCourseImage.png";
import RequestSentImg from "../../media/createCourseRequestSent.svg";

const currentTerm = CURRENT_SEMESTER.substring(0, 2);
const currentYear = CURRENT_SEMESTER.substring(2, 4);

type Props = {
    setCourseCreatePopup: any;
    userId: string;
};

const CourseCreatePopup = ({ setCourseCreatePopup, userId }: Props) => {
    const [courseCreatePopupContinue, setCourseCreatePopupContinue] = useState(false);
    const [courseCreatePopupEnding, setCourseCreatePopupEnding] = useState(false);

    const [isProf, setIsProf] = useState(true);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [year, setYear] = useState(currentYear);
    const [term, setTerm] = useState(currentTerm);

    const [showCodeError, setShowCodeError] = useState(false);
    const [showNameError, setShowNameError] = useState(false);

    const [courseIdError, setcourseIdError] = useState("");
    const [showCourseIdError, setShowCourseIdError] = useState(false);

    const handleTextField = (
        event: React.ChangeEvent<HTMLElement>,
        setStateFunction: React.Dispatch<React.SetStateAction<string>>,
        setErrorStateFunction: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        const target = event.target as HTMLTextAreaElement;
        setStateFunction(target.value);
        setErrorStateFunction(false);
    };

    const handleSelect = (
        event: React.ChangeEvent<HTMLElement>,
        setStateFunction: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const target = event.target as HTMLSelectElement;
        setStateFunction(target.value);
    };

    const checkInputs = () => {
        const codeArray = code.split(" ");
        const codeError = codeArray.length !== 2 || !/^[a-zA-Z]+$/.test(codeArray[0]) || !/^\d+$/.test(codeArray[1]);
        const nameError = name === "";

        setShowCodeError(codeError);
        setShowNameError(nameError);

        return !codeError && !nameError;
    };

    const createPendingCourse = async () => {
        if (!checkInputs()) {
            return;
        }

        const courseId = (code + "-" + term + "-" + year).replace(/\s/g, "").toLowerCase();
        const semester = term + year;
        const professors = isProf ? [userId] : [];
        const tas = !isProf ? [userId] : [];

        const startMonth = term === "FA" ? "08" : "01";
        const endMonth = term === "FA" ? "12" : "05";
        const startDate = semester === CURRENT_SEMESTER ? START_DATE : "20" + year + "-" + startMonth + "-01";
        const endDate = semester === CURRENT_SEMESTER ? END_DATE : "20" + year + "-" + endMonth + "-31";

        const course = {
            code,
            endDate: firebase.firestore.Timestamp.fromDate(new Date(endDate)),
            name,
            queueOpenInterval: 30,
            semester,
            startDate: firebase.firestore.Timestamp.fromDate(new Date(startDate)),
            professors,
            tas,
            courseId,
            charLimit: 140,
            term,
            year,
        };

        try {
            await addPendingCourse(courseId, course);

            setCourseCreatePopupEnding(true);
            setCourseCreatePopupContinue(false);
        } catch (error) {
            setcourseIdError(code + ", " + semester + " is already a course or pending course.");
            setShowCourseIdError(true);
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
                        <p className="input_label">
                            I'm a... <span className="required">*</span>
                        </p>
                        <p>Professor</p>
                        <input
                            type="radio"
                            id="professor"
                            name="fav_language"
                            value="HTML"
                            defaultChecked={isProf}
                            onClick={() => setIsProf(true)}
                        />
                        <p>TA</p>
                        <input
                            type="radio"
                            id="ta"
                            name="fav_language"
                            value="HTML"
                            defaultChecked={!isProf}
                            onClick={() => setIsProf(false)}
                        />
                    </div>
                    <label htmlFor="course_code" className="input_component">
                        <p className="input_label">
                            Course Code <span className="required">*</span>
                        </p>
                        <input
                            id="course_code"
                            type="text"
                            value={code || ""}
                            placeholder="E.g. CS 1110 (including a space)"
                            onChange={(e) => handleTextField(e, setCode, setShowCodeError)}
                        />
                        <p />
                    </label>
                    {showCodeError && (
                        <p className="errorMessage"> Please enter a valid course code to create a new class. </p>
                    )}
                    {showCourseIdError && <p className="errorMessage">{courseIdError}</p>}
                    <label htmlFor="course_code" className="input_component">
                        <p className="input_label">
                            Course Name <span className="required">*</span>
                        </p>
                        <input
                            id="course_name"
                            type="text"
                            value={name || ""}
                            placeholder="E.g. Introduction to Computing Using Python"
                            onChange={(e) => handleTextField(e, setName, setShowNameError)}
                        />
                    </label>
                    {showNameError && (
                        <p className="errorMessage"> Please enter a valid course name to create a new class. </p>
                    )}
                    <div className="dropdownSection">
                        <label htmlFor="year" className="input_component">
                            <p className="input_label">
                                Year <span className="required">*</span>
                            </p>
                            <select id="year" value={year} onChange={(e) => handleSelect(e, setYear)}>
                                <option value="23">2023</option>
                                <option value="24">2024</option>
                                <option value="25">2025</option>
                            </select>
                        </label>
                        <label htmlFor="term" className="input_component">
                            <p className="input_label">
                                Term <span className="required">*</span>
                            </p>
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
    ) : !courseCreatePopupEnding ? (
        <>
            <div className="courseCreatePopupBackground">
                <div className="createCoursePopupContainer">
                    <Icon link name="close" onClick={() => setCourseCreatePopup(false)} />
                    <div className="createNewClassHeader">
                        <img className="createCourseImg" src={CreateCourseImg} alt="logo" />
                        <h1>Create a New Class</h1>
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
    ) : (
        <>
            <div className="courseCreatePopupBackground">
                <div className="createCoursePopupContainer">
                    <Icon link name="close" onClick={() => setCourseCreatePopup(false)} />
                    <div className="createNewClassHeader">
                        <img className="createCourseImg" src={RequestSentImg} alt="logo" />
                        <h1>Request Sent</h1>
                    </div>
                    <p>
                        The QMI team will notify you through e-mail and notification. Please wait patiently until then.
                    </p>
                    <div className="buttons">
                        <button type="button" className="continue" onClick={() => setCourseCreatePopup(false)}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CourseCreatePopup;
