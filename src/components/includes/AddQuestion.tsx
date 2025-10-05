import React, { useState, useEffect } from "react";
import { Redirect } from "react-router";
import { Checkbox } from "semantic-ui-react";
import moment from "moment";
import { collection, CollectionReference, query, where} from 'firebase/firestore';
import firebase from "firebase/compat/app";
import { collectionData, firestore, auth } from "../../firebase";
import SelectedTags from "./SelectedTags";
import SessionAlertModal from "./SessionAlertModal";

import { addQuestion } from "../../firebasefunctions/sessionQuestion";

const compatFirestore = firebase.firestore();

const LOCATION_CHAR_LIMIT = 40;
const WARNING_THRESHOLD = 10; // minutes left in queue

// States
const INITIAL_STATE = 10;
const PRIMARY_SELECTED = 20;
const SECONDARY_SELECTED = 30;
const LOCATION_INPUTTED = 40;
const QUESTION_INPUTTED = 50;
const CLOSE_TO_END_OF_OH = 60;

type Props = {
    session: FireSession;
    course: FireCourse;
    mobileBreakpoint: number;
    showProfessorStudentView: boolean;
};

/**
 * `AddQuestion` Component - Displays a component that allows users ask a question
 *  to join the queue.
 * 
 * @remarks
 * This component is used within a course session to enable students to submit 
 * questions to join the queue. The user submits information about location as well
 * as the specific assignment. It adapts its layout based on screen size and provides different 
 * views depending on the user's role (professor's student view or student view).
 * 
 * @param props - Contains:
 *   - `course`: The course associated with the session.
 *   - `session`: The current session where the question will be added.
 *   - `mobileBreakpoint`: The screen width threshold for mobile layout.
 *   - `showProfessorStudentView`: boolean to toggle ProfessorStudentView.
 */
const AddQuestion = ({ course, session, mobileBreakpoint, showProfessorStudentView }: Props) => {
    /*
     * State machine states
     * 10 - initial state - nothing selected, secondary & text fields locked
     * 20 - primary selected - shows a single primary tag, unlocks secondary
     * 30 - one or more secondary tags selected - unlocks location field
     * 40 - location inputted - unlocks question field
     * 50 - contents in question field - unlocks submit button
     * 60 - Warning modal (replaces question modal) - toggles after submit if n minutes are left in queue
     */

    const [location, setLocation] = useState<string>("");
    const [question, setQuestion] = useState<string>("");
    const [stage, setStage] = useState<number>(INITIAL_STATE);
    const [width, setWidth] = useState<number>(window.innerWidth);
    const [selectedPrimary, setSelectedPrimary] = useState<FireTag>();
    const [selectedSecondary, setSelectedSecondary] = useState<FireTag>();
    const [redirect, setRedirect] = useState<boolean>(false);
    const [tags, setTags] = useState<FireTag[]>([]);
    // For hybrid sessions to keep track if student is in virtual location
    const [isVirtual, setIsVirtual] = useState<boolean>(false);
    const [missingPrimaryTags, setMissingPrimaryTags] = useState<boolean>(false);
    const [missingSecondaryTags, setMissingSecondaryTags] = useState<boolean>(false);
    const [missingLocation, setMissingLocation] = useState<boolean>(false);
    const [missingQuestion, setMissingQuestion] = useState<boolean>(false);
    const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false);

    const primaryTags = tags.filter((tag) => tag.level === 1);
    const secondaryTags = tags.filter((tag) => tag.level === 2);
    const activeTags = tags.filter((tag) => tag.active);
    const locationMissing = ((session.modality === "hybrid" && isVirtual) || session.modality === "virtual") 
        ? false : !location;

    useEffect(() => {
        const updateWindowDimensions = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener("resize", updateWindowDimensions);

        return () => {
            window.removeEventListener("resize", updateWindowDimensions);
        };
    }, []);

   
    useEffect(() => {
        const tags$ = collectionData<FireTag>(
            query(collection(firestore, 'tags') as CollectionReference<FireTag>, 
                where('courseId', '==', course.courseId)),{idField: "tagId"}
        );

        const subscription = tags$.subscribe((newTags) => setTags(newTags));
        return () => {
            subscription.unsubscribe();
        };
    }, [course.courseId]);

    const handleXClick = () => {
        setRedirect(true);
    };

    const handlePrimarySelected = (tag: FireTag | undefined): void => {
        if (tag) {
            setMissingPrimaryTags(false);
        } else {
            setMissingPrimaryTags(true); 
        }
        if (selectedPrimary) {
            setLocation("");
            setQuestion("");
            if (selectedPrimary.tagId === tag?.tagId) {
                setStage(INITIAL_STATE);
                setSelectedPrimary(undefined);
                setSelectedSecondary(undefined);
            } else {
                setStage(PRIMARY_SELECTED);
                setSelectedPrimary(tag);
                setSelectedSecondary(undefined);
            }
        } else if (stage <= INITIAL_STATE) {
            setStage(PRIMARY_SELECTED);
            setSelectedPrimary(tag);
        } else {
            setStage(INITIAL_STATE);
            setSelectedPrimary(undefined);
            setSelectedSecondary(undefined);
        }
    };

    const handleSecondarySelected = (tag: FireTag): void => {
        if (tag) {
            setMissingSecondaryTags(false); 
        } else {
            setMissingSecondaryTags(true); 
        }
        if (selectedSecondary) {
            setLocation("");
            setQuestion("");
            if (selectedSecondary.tagId === tag.tagId) {
                setStage(PRIMARY_SELECTED);
                setSelectedSecondary(undefined);
            } else {
                !("building" in session) ? setStage(LOCATION_INPUTTED) : setStage(SECONDARY_SELECTED);
                setSelectedSecondary(tag);
            }
        } else if (!("building" in session)) {
            setStage(LOCATION_INPUTTED);
            setSelectedSecondary(tag);
        } else {
            if (session.modality === "hybrid" && typeof session.useTALink !== "undefined" && session.useTALink) {
                setStage(LOCATION_INPUTTED);
            } else {
                setStage(SECONDARY_SELECTED);
            }
            setSelectedSecondary(tag);
        }
    };

    const handleUpdateLocation = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const target = event.target as HTMLTextAreaElement;
        let newStage: number;

        const isLocationEmpty = target.value.length === 0;
        setMissingLocation(isLocationEmpty);

        if (target.value.length > 0) {
            if (question.length > 0) {
                newStage = QUESTION_INPUTTED;
            } else {
                newStage = LOCATION_INPUTTED;
            }
        } else {
            newStage = SECONDARY_SELECTED;
        }

        if (session.modality === "in-person") {
            setLocation(target.value.length <= LOCATION_CHAR_LIMIT ? target.value : location);
            setStage(newStage);
        } else {
            setLocation(target.value);
            setStage(newStage);
        }
    };

    const handleUpdateQuestion = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const target = event.target as HTMLTextAreaElement;
        const isQuestionEmpty = target.value.length === 0;
        setMissingQuestion(isQuestionEmpty);
        setQuestion(target.value.length <= course.charLimit ? target.value : question);
        setStage(target.value.length > 0 ? QUESTION_INPUTTED : LOCATION_INPUTTED);
    };

    const addNewQuestion = () => {
        const allowRedirect = addQuestion(
            auth.currentUser,
            session,
            course,
            compatFirestore,
            location,
            selectedPrimary,
            selectedSecondary,
            question,
            isVirtual
        );

        setRedirect(allowRedirect);
    };

    const handleClick = () : void => {
        // eslint-disable-next-line no-console
        console.log("Button Clicked");

        setAttemptedSubmit(true);

        setMissingPrimaryTags(!selectedPrimary);
        setMissingSecondaryTags(!selectedSecondary);
        setMissingLocation(locationMissing);
        setMissingQuestion(!question);

        if ((primaryTags.length > 0 && (missingPrimaryTags || !selectedPrimary)) 
            || (secondaryTags.length > 0 && (missingSecondaryTags || !selectedSecondary)) 
            || (missingLocation || locationMissing) || (missingQuestion || !question)) {
            // eslint-disable-next-line no-console
            console.log("Fields missing, showing error state");
            return;
        }
    
        // eslint-disable-next-line no-console
        console.log("All fields filled, submitting...");
        handleJoinClick(); 
    };

    useEffect(() => {
        // eslint-disable-next-line no-console
        console.log({
            missingPrimaryTags,
            missingSecondaryTags,
            missingLocation,
            missingQuestion,
        });
    }, [missingPrimaryTags, missingSecondaryTags, missingLocation, missingQuestion]);
    
    useEffect(() => {
        if (attemptedSubmit){
            setMissingPrimaryTags(!selectedPrimary);
            setMissingSecondaryTags(!selectedSecondary);
            setMissingLocation(locationMissing);
            setMissingQuestion(!question);
        }
    }, [selectedPrimary, selectedSecondary, location, locationMissing, question, attemptedSubmit]);


    const handleJoinClick = (): void => {
        if (
            stage !== CLOSE_TO_END_OF_OH &&
            moment()
                .add(WARNING_THRESHOLD, "minutes")
                .isAfter(session.endTime.seconds * 1000)
        ) {
            setStage(CLOSE_TO_END_OF_OH);
        } else {
            addNewQuestion();
        }
    };

    const handleKeyPressDown = (event: React.KeyboardEvent<HTMLElement>) => {
        // CTRL + ENTER or CMD + ENTER adds the question ONLY if cursor in Question textbox
        if (
            !event.repeat &&
            (event.ctrlKey || event.metaKey) &&
            event.keyCode === 13 &&
            (stage > LOCATION_INPUTTED || primaryTags.length === 0 || secondaryTags.length === 0)
        ) {
            addNewQuestion();
        } else if (!event.repeat && event.keyCode === 27) {
            handleXClick();
        }
    };

    const Asterisk = () => <span className="required"> * </span>;

    if (redirect) {
        return (
            <Redirect
                push={true}
                to={
                    (showProfessorStudentView ? "/professor-student-view/course/" : "/course/") +
                    course.courseId +
                    "/session/" +
                    session.sessionId
                }
            />
        );
    }

    return (
        
        <div className="QuestionView" onKeyDown={(e) => handleKeyPressDown(e)}>
            {(stage < CLOSE_TO_END_OF_OH || width < mobileBreakpoint) && (
                <div className="AddQuestion">
                    <div className="queueHeader">
                        <p className="title">Join The Queue</p>
                    </div>
                    <div className="tagsContainer">
                        {primaryTags.length !== 0 && (
                            <>
                                <div className={`topRow ${missingPrimaryTags ? "error" : ""}`}>
                                    <div className="disclaimerContainer text">
                                        <p> <Asterisk /> Required</p>
                                    </div>
                                    <div className="tagsMiniContainer">
                                        <p className="header">Select a Category<Asterisk /></p>
                                        <div className="category">
                                            {tags
                                                .filter((tag) => tag.active && tag.level === 1)
                                                .map((tag) => (
                                                    <SelectedTags
                                                        key={tag.tagId}
                                                        tag={tag}
                                                        isSelected={stage > INITIAL_STATE}
                                                        onClick={() => handlePrimarySelected(tag)}
                                                        check={tag.name === selectedPrimary?.name}
                                                        isPrimary={true}
                                                        select={true}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                </div>
                                
                            </>
                        )}
                        {secondaryTags.length !== 0 && (
                            <>
                                <hr />
                                <div className={`tagsMiniContainer 
                                    ${missingSecondaryTags ? "error " :  ""}`
                                    + !!selectedPrimary
                                }
                                >
                                    <p className="header">Select a Tag<Asterisk /></p>
                                    {selectedPrimary ? (
                                        tags
                                            .filter((tag) => tag.active && tag.level === 2)
                                            .filter((tag) => tag.parentTag === selectedPrimary.tagId)
                                            .map((tag) => (
                                                <SelectedTags
                                                    key={tag.tagId}
                                                    tag={tag}
                                                    isSelected={selectedSecondary === tag}
                                                    onClick={() => handleSecondarySelected(tag)}
                                                    check={tag.name === selectedSecondary?.name}
                                                    select={true}
                                                />
                                            ))
                                    ) : (
                                        <p className="placeHolder">
                                            {activeTags.length > 0 ? "First select a category" : ""}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                        <hr />
                        {"building" in session && (
                            <>
                                {" "}
                                <div className={`tagsMiniContainer ${missingLocation  ? "error" : ""}`}>
                                    {
                                        <p className="header">
                                            {session.modality === "hybrid" ? "Location or Zoom Link" : "Location"}{" "}
                                            &nbsp;
                                            {session.modality === "in-person" && (
                                                <span
                                                    className={
                                                        "characterCount " +
                                                        (location.length >= LOCATION_CHAR_LIMIT ? "warn" : "")
                                                    }
                                                >
                                                    ({LOCATION_CHAR_LIMIT - location.length} character
                                                    {LOCATION_CHAR_LIMIT - location.length !== 1 && "s"} left)
                                                </span>
                                            )}
                                            <Asterisk/>
                                        </p>
                                    }
                                    {stage >= SECONDARY_SELECTED || activeTags.length === 0 ? (
                                        <div className="locationInput">
                                            {session.modality === "hybrid" && (
                                                <Checkbox
                                                    className="hybridCheckbox"
                                                    label="Are you virtual?"
                                                    checked={isVirtual}
                                                    onClick={() => {
                                                        setIsVirtual(!isVirtual);
                                                        !isVirtual && setMissingLocation(false);
                                                        isVirtual && setMissingLocation(true);
                                                        !isVirtual && setStage(LOCATION_INPUTTED);
                                                    }}
                                                />
                                            )}
                                            {!(
                                                session.modality === "hybrid" &&
                                                typeof session.useTALink !== "undefined" &&
                                                session.useTALink && isVirtual
                                            ) && (
                                                <textarea
                                                    className="TextInput location"
                                                    value={location}
                                                    onChange={handleUpdateLocation}
                                                    placeholder={
                                                        session.modality === "in-person" || !isVirtual
                                                            ? "Enter where you are (room & location in room)"
                                                            : "What is your zoom link?"
                                                    }
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <p className="placeHolder text">Finish selecting tags...</p>
                                    )}
                                </div>
                            </>
                        )}
                        <hr/>
                        <div className={`tagsMiniContainer ${missingQuestion ? "error" : ""}`}>
                            <p className="header">{"Question "} <Asterisk /></p>
                            {stage >= LOCATION_INPUTTED ||
                            primaryTags.length === 0 ||
                            secondaryTags.length === 0 ||
                            activeTags.length === 0 ? (
                                    <textarea
                                        className="TextInput question"
                                        value={question}
                                        onChange={handleUpdateQuestion}
                                        placeholder="What would you like help or feedback on?"
                                    />
                                ) : (
                                    <textarea
                                        disabled
                                        className="TextInput question"
                                        value={question}
                                        onChange={handleUpdateQuestion}
                                        placeholder={
                                            !("building" in session)
                                                ? "First select a category and a tag"
                                                : "Enter your location..."
                                        }
                                    />
                                )}
                        </div>
                        <div className="addButtonWrapper">
                            <p
                                className={`AddButton ${stage > LOCATION_INPUTTED 
                                    || primaryTags.length === 0 
                                    || secondaryTags.length === 0 ? "active" : ""}`}
                                onClick={handleClick}
                            >
                                Add My Question
                            </p>
                            
                        </div>
                    </div>
                </div>
            )}
            {stage === CLOSE_TO_END_OF_OH && (
                <SessionAlertModal
                    header={"Warning"}
                    icon={"exclamation"}
                    color={"yellow"}
                    description={
                        "This session ends at " +
                        moment(session.endTime.seconds * 1000).format("h:mm A") +
                        ". Consider adding yourself to a later queue."
                    }
                    buttons={["Cancel Question", "Add Anyway"]}
                    cancelAction={handleXClick}
                    course={course}
                    mainAction={() => handleJoinClick()}
                    displayShade={width < mobileBreakpoint}
                />
            )}
        </div>
    );
};

export default AddQuestion;
