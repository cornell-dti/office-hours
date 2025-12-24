import * as React from "react";
import { useState } from "react";
import { Icon } from "semantic-ui-react";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { Timestamp } from "../../firebase"
import { CURRENT_SEMESTER, START_DATE, END_DATE } from "../../constants";
import { addPendingCourse } from "../../firebasefunctions/courses";
import CreateCourseImg from "../../media/createCourseImage.png";
import RequestSentImg from "../../media/createCourseRequestSent.svg";
import { generateInitialWaitTimeMap } from "../../firebasefunctions/waitTimeMap";

const currentTerm = CURRENT_SEMESTER.substring(0, 2);
const currentYear = CURRENT_SEMESTER.substring(2, 4);
const nextYear = (Number.parseInt(currentYear, 10) + 1).toString();

type Props = {
    setCourseCreatePopup: any;
    setCourseCreateHover: any;
    userId: string;
};

const CourseCreatePopup = ({ setCourseCreatePopup, setCourseCreateHover, userId }: Props) => {
    const [courseCreatePopupContinue, setCourseCreatePopupContinue] = useState(false);
    const [courseCreatePopupEnding, setCourseCreatePopupEnding] = useState(false);

    const [isProf, setIsProf] = useState(true);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [year, setYear] = useState(currentYear);
    const [term, setTerm] = useState(currentTerm);
    const [interval, setInterval] = useState("30");
    const [charLimit, setCharLimit] = useState("140");

    const [showCodeError, setShowCodeError] = useState(false);
    const [showNameError, setShowNameError] = useState(false);
    const [showIntervalError, setShowIntervalError] = useState(false);
    const [showCharError, setShowCharError] = useState(false);

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

    const handleSelectYear = (event: SelectChangeEvent) => {
        setYear(event.target.value as string);
    };
    const handleSelectTerm = (event: SelectChangeEvent) => {
        setTerm(event.target.value as string);
    };

    const handleNumberField = (
        event: React.ChangeEvent<HTMLElement>,
        setStateFunction: React.Dispatch<React.SetStateAction<string>>,
        setErrorStateFunction: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        const target = event.target as HTMLTextAreaElement;
        const value = target.value;
        // Allow empty input (user deleting)
        if (value === "") {
            setStateFunction("");
            setErrorStateFunction(false);
            return;
        }

        // Allow only digits
        if (!/^\d+$/.test(value) || Number.isNaN(Number.parseInt(value,10))) {
            return;
        }

        setStateFunction(value);
        setErrorStateFunction(false);
        
    };

    const handleClick = () => {
        setCourseCreatePopup(false);
        setCourseCreateHover(true);
    };

    /**
     * This function checks if the course code and name are valid. Valid course codes are in the form:
     * group of chars, space, and then a group of numbers. Valid course names are not empty strings.
     * If either the course code or name are invalid, a corresponding error message is shown.
     * @returns true if both the course code and name are valid, false otherwise.
     */
    const checkInputs = () => {
        const codeArray = code.split(" ");
        const codeError = codeArray.length !== 2 || !/^[a-zA-Z]+$/.test(codeArray[0]) || !/^\d+$/.test(codeArray[1]);
        const nameError = name === "";
        const charError = Number.isNaN(Number.parseInt(charLimit, 10)) || Number.parseInt(charLimit, 10) < 50;
        const intervalError = Number.isNaN(Number.parseInt(interval, 10))
        || Number.parseInt(interval, 10) < 0 || Number.parseInt(interval, 10) > 60;

        setShowCodeError(codeError);
        setShowNameError(nameError);
        setShowCharError(charError);
        setShowIntervalError(intervalError);

        return !codeError && !nameError && !charError && !intervalError;
    };

    const createPendingCourse = async () => {
        if (!checkInputs()) {
            return;
        }

        const courseId = (code + "-" + term + "-" + year).replace(/\s/g, "").toLowerCase();
        const semester = term + year;
        const professors = [userId];
        const tas:string[]= [];

        const startMonth = term === "FA" ? "08" : "01";
        const endMonth = term === "FA" ? "12" : "05";
        const startDate = semester === CURRENT_SEMESTER ? START_DATE : "20" + year + "-" + startMonth + "-01";
        const endDate = semester === CURRENT_SEMESTER ? END_DATE : "20" + year + "-" + endMonth + "-31";

        if (Number.isNaN(Number.parseInt(interval,10)) || Number.isNaN(Number.parseInt(charLimit,10))) {
            setShowCharError(true);
            setShowIntervalError(true);
            return;
        }

        const course = {
            code,
            endDate: Timestamp.fromDate(new Date(endDate)),
            name,
            queueOpenInterval: Number.parseInt(interval,10),
            semester,
            startDate: Timestamp.fromDate(new Date(startDate)),
            professors,
            tas,
            courseId,
            charLimit: Number.parseInt(charLimit,10),
            term,
            year,
            waitTimeMap: generateInitialWaitTimeMap()
        };

        try {
            await addPendingCourse(courseId, course);

            setCourseCreatePopupEnding(true);
            setCourseCreatePopupContinue(false);
        } catch (error) {
            setcourseIdError(code + " is already a course or pending course for " + semester + ".");
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
                            I'm a...
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
                            Course Code
                        </p>
                        <p className="input_label_valid">
                            A valid course code is a series of characters, followed by a space, followed by numbers.
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
                        <p className="errorMessage"> 
                        Please enter a course code in the correct format: MAJOR 1234 (e.g. CS 1110). 
                        </p>
                    )}
                    {showCourseIdError && <p className="errorMessage">{courseIdError}</p>}
                    <label htmlFor="course_code" className="input_component">
                        <p className="input_label">
                            Course Name
                        </p>
                        <p className="input_label_valid">
                            A valid course name is not empty.
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

                    <label className="input_component">
                        <p className="input_label">
                            Settings
                        </p>
                        <p className="input_label_valid">
                            <b>Queue Open Interval</b> determines how long before OH starts that the queue opens. (0-60 min)
                            <br></br>
                            <b>Character Limit</b> determines how long of a question that students can input. (at least 50 characters)
                        </p>
                    </label>
                     {showIntervalError && (
                        <p className="errorMessage"> Please enter a interval number between 0-60 minutes. </p>
                    )}
                     {showCharError && (
                        <p className="errorMessage"> Please enter a character limit amount that is at least 50. </p>
                    )}
                    <div className="numberSection">
                        <FormControl fullWidth sx={{m:1}}>
                            <TextField 
                                id="queue-interval" 
                                label="Queue Opening Interval" 
                                variant="outlined"
                                value={interval} 
                                inputProps={{
                                    inputMode: "numeric",
                                    pattern: "[0-9]*"
                                }}
                                onChange={(value) => handleNumberField(value, setInterval, setShowIntervalError)}
                            />
                        </FormControl>
                        <FormControl fullWidth sx={{m:1}}>
                            <TextField 
                                id="char-limit"
                                label="Character Limit" 
                                variant="outlined"
                                value={charLimit}
                                inputProps={{
                                    inputMode: "numeric",
                                    pattern: "[0-9]*"
                                }}
                                onChange={(value) => handleNumberField(value, setCharLimit, setShowCharError)}
                            />
                        </FormControl>
                        
                    </div>


                    <div className="dropdownSection">

                        <FormControl fullWidth sx={{ m: 1 }}>
                            <InputLabel id="term-label">Term</InputLabel>
                            <Select
                                labelId="term-select-label"
                                id="term-select"
                                value={term}
                                label="Term"
                                onChange={handleSelectTerm}
                                style={{textAlign: 'left'}}
                                
                            >
                                <MenuItem value="SP">Spring</MenuItem>
                                <MenuItem value="FA">Fall</MenuItem>
                            </Select>
                        </FormControl>
                     
                        <FormControl fullWidth sx={{ m: 1 }}>
                            <InputLabel id="year-label">Year</InputLabel>
                            <Select
                                labelId="year-select-label"
                                id="year-select"
                                value={year}
                                label="Year"
                                onChange={handleSelectYear}
                                style={{textAlign: 'left'}}
                            >
                                <MenuItem value={currentYear}>{currentYear}</MenuItem>
                                <MenuItem value={nextYear}>{nextYear}</MenuItem>
                            </Select>
                        </FormControl>
                  
                    </div>
                </form>
                <button 
                    type="button" 
                    className={"submit " + (code && name && term && year ? "":"invalid")} 
                    onClick={createPendingCourse}
                >
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
                        Please proceed only if you are a professor or authorized TA. 
                        The QMI team will verify your submission.
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
                        The QMI team will notify you through e-mail and notification. Thank you for your patience!
                    </p>
                    <div className="buttons">
                        <button type="button" className="continue" onClick={handleClick}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CourseCreatePopup;
