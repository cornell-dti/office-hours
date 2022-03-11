import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router';
import { Checkbox } from 'semantic-ui-react';
import moment from 'moment';

import SelectedTags from './SelectedTags';
import SessionAlertModal from './SessionAlertModal';

import { collectionData, firestore, auth } from '../../firebase';
import { addQuestion } from '../../firebasefunctions/sessionQuestion';

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
};

const AddQuestion = ({ course, session, mobileBreakpoint }: Props) => {
    /*
     * State machine states
     * 10 - initial state - nothing selected, secondary & text fields locked
     * 20 - primary selected - shows a single primary tag, unlocks secondary
     * 30 - one or more secondary tags selected - unlocks location field
     * 40 - location inputted - unlocks question field
     * 50 - contents in question field - unlocks submit button
     * 60 - Warning modal (replaces question modal) - toggles after submit if n minutes are left in queue
     */

    const [location, setLocation] = useState<string>('');
    const [question, setQuestion] = useState<string>('');
    const [stage, setStage] = useState<number>(INITIAL_STATE);
    const [width, setWidth] = useState<number>(window.innerWidth);
    const [selectedPrimary, setSelectedPrimary] = useState<FireTag>();
    const [selectedSecondary, setSelectedSecondary] = useState<FireTag>();
    const [redirect, setRedirect] = useState<boolean>(false);
    const [tags, setTags] = useState<FireTag[]>([]);
    // For hybrid sessions to keep track if student is in virtual location
    const [isVirtual, setIsVirtual] = useState<boolean>(false);

    const primaryTags = tags.filter((tag) => tag.level === 1);
    const secondaryTags = tags.filter((tag) => tag.level === 2);
    const activeTags = tags.filter((tag) => tag.active);

    useEffect(() => {
        const updateWindowDimensions = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener('resize', updateWindowDimensions);

        const tags$ = collectionData<FireTag>(
            firestore
                .collection('tags')
                .where('courseId', '==', course.courseId),
            'tagId'
        );

        tags$.subscribe((newTags) => setTags(newTags));
        return () => {
            window.removeEventListener('resize', updateWindowDimensions);
        };
    });

    const handleXClick = () => {
        setRedirect(true);
    };

    const handlePrimarySelected = (tag: FireTag | undefined): void => {
        if (selectedPrimary) {
            setLocation('');
            setQuestion('');
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
        if (selectedSecondary) {
            setLocation('');
            setQuestion('');
            if (selectedSecondary.tagId === tag.tagId) {
                setStage(PRIMARY_SELECTED);
                setSelectedSecondary(undefined);
            } else {
                !('building' in session) ? setStage(LOCATION_INPUTTED) : setStage(SECONDARY_SELECTED);
                setSelectedSecondary(tag);
            }
        } else if (!('building' in session)) {
            setStage(LOCATION_INPUTTED);
            setSelectedSecondary(tag);
        } else {
            if (session.modality === 'hybrid' && typeof session.useTALink !== 'undefined' && session.useTALink) {
                setStage(LOCATION_INPUTTED);
            } else {
                setStage(SECONDARY_SELECTED);
            }
            setSelectedSecondary(tag);
        }
    };

    const handleUpdateLocation = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ): void => {
        const target = event.target as HTMLTextAreaElement;
        let newStage: number;
        if (target.value.length > 0) {
            if (question.length > 0) {
                newStage = QUESTION_INPUTTED;
            } else {
                newStage = LOCATION_INPUTTED;
            }
        } else {
            newStage = SECONDARY_SELECTED;
        }

        if (session.modality === 'in-person') {
            setLocation(
                target.value.length <= LOCATION_CHAR_LIMIT
                    ? target.value
                    : location
            );
            setStage(newStage);
        } else {
            setLocation(target.value);
            setStage(newStage);
        }
    };

    const handleUpdateQuestion = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ): void => {
        const target = event.target as HTMLTextAreaElement;
        setQuestion(
            target.value.length <= course.charLimit ? target.value : question
        );
        setStage(target.value.length > 0 ? QUESTION_INPUTTED : LOCATION_INPUTTED);
    };

    const addNewQuestion = () => {
        const allowRedirect = addQuestion(
            auth.currentUser,
            session,
            firestore,
            location,
            selectedPrimary,
            selectedSecondary,
            question,
            isVirtual
        );

        setRedirect(allowRedirect);
    };

    const handleJoinClick = (): void => {
        if (
            stage !== CLOSE_TO_END_OF_OH &&
            moment()
                .add(WARNING_THRESHOLD, 'minutes')
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
            (stage > LOCATION_INPUTTED ||
                primaryTags.length === 0 ||
                secondaryTags.length === 0)
        ) {
            addNewQuestion();
        } else if (!event.repeat && event.keyCode === 27) {
            handleXClick();
        }
    };

    if (redirect) {
        return (
            <Redirect
                push={true}
                to={
                    '/course/' +
                    course.courseId +
                    '/session/' +
                    session.sessionId
                }
            />
        );
    }

    return (
        <div className='QuestionView' onKeyDown={(e) => handleKeyPressDown(e)}>
            {(stage < CLOSE_TO_END_OF_OH || width < mobileBreakpoint) && (
                <div className='AddQuestion'>
                    <div className='queueHeader'>
                        <p className='title'>Join The Queue</p>
                    </div>
                    <div className='tagsContainer'>
                        {primaryTags.length !== 0 && (
                            <>
                                <hr />
                                <div className='tagsMiniContainer'>
                                    <p className='header'>Select a Category</p>
                                    <div className='QuestionTags'>
                                        {tags
                                            .filter(
                                                (tag) =>
                                                    tag.active &&
                                                    tag.level === 1
                                            )
                                            .map((tag) => (
                                                <SelectedTags
                                                    key={tag.tagId}
                                                    tag={tag}
                                                    isSelected={stage > INITIAL_STATE}
                                                    onClick={() =>
                                                        handlePrimarySelected(
                                                            tag
                                                        )
                                                    }
                                                    check={
                                                        tag.name ===
                                                        selectedPrimary?.name
                                                    }
                                                    isPrimary={true}
                                                    select={true}
                                                />
                                            ))}
                                    </div>
                                </div>
                            </>
                        )}
                        {secondaryTags.length !== 0 && (
                            <>
                                <hr />
                                <div
                                    className={
                                        'tagsMiniContainer secondaryTags ' +
                                        !!selectedPrimary
                                    }
                                >
                                    <p className='header'>Select a Tag</p>
                                    {selectedPrimary ? (
                                        tags
                                            .filter(
                                                (tag) =>
                                                    tag.active &&
                                                    tag.level === 2
                                            )
                                            .filter(
                                                (tag) =>
                                                    tag.parentTag ===
                                                    selectedPrimary.tagId
                                            )
                                            .map((tag) => (
                                                <SelectedTags
                                                    key={tag.tagId}
                                                    tag={tag}
                                                    isSelected={
                                                        selectedSecondary ===
                                                        tag
                                                    }
                                                    onClick={() =>
                                                        handleSecondarySelected(
                                                            tag
                                                        )
                                                    }
                                                    check={
                                                        tag.name ===
                                                        selectedSecondary?.name
                                                    }
                                                    select={true}
                                                />
                                            ))
                                    ) : (
                                        <p className='placeHolder'>
                                            First select a category
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                        <hr />
                        {'building' in session && (
                            <>
                                {' '}
                                <div className='tagsMiniContainer'>
                                    {
                                        <p className='header'>
                                            {session.modality === 'hybrid' ? 
                                                'Location or Zoom Link' : 'Location'} &nbsp;
                                            {session.modality ===
                                                'in-person' && (
                                                <span
                                                    className={
                                                        'characterCount ' +
                                                        (location.length >=
                                                        LOCATION_CHAR_LIMIT
                                                            ? 'warn'
                                                            : '')
                                                    }
                                                >
                                                    (
                                                    {LOCATION_CHAR_LIMIT -
                                                        location.length}{' '}
                                                    character
                                                    {LOCATION_CHAR_LIMIT -
                                                        location.length !==
                                                        1 && 's'}{' '}
                                                    left)
                                                </span>
                                            )}
                                        </p>
                                    }
                                    {stage >= SECONDARY_SELECTED || activeTags.length === 0 ? (
                                        <div className='locationInput'>
                                            {session.modality === 'hybrid' && 
                                            <Checkbox
                                                className="hybridCheckbox"
                                                label="Are you virtual?" 
                                                checked={isVirtual}
                                                onClick={() => setIsVirtual(!isVirtual)}
                                            />}
                                            {!(session.modality === 'hybrid' && 
                                            typeof session.useTALink !== 'undefined' && session.useTALink) &&
                                                <textarea
                                                    className='TextInput location'
                                                    value={location}
                                                    onChange={handleUpdateLocation}
                                                    placeholder={(session.modality === 'in-person' || !isVirtual) ? 
                                                        'What is your location?' : 'What is your zoom link?'}
                                                /> 
                                            }
                                        </div>
                                    ) : (
                                        <p className='placeHolder text'>
                                            Finish selecting tags...
                                        </p>
                                    )}
                                </div>
                                <hr />
                            </>
                        )}
                        <div className='tagsMiniContainer'>
                            <p className='header'>{'Question '}</p>
                            {stage >= LOCATION_INPUTTED ||
                            primaryTags.length === 0 ||
                            secondaryTags.length === 0 ||
                            activeTags.length === 0 ? (
                                    <textarea
                                        className='TextInput question'
                                        value={question}
                                        onChange={handleUpdateQuestion}
                                        placeholder="What's your question about?"
                                    />
                                ) : (
                                    <textarea
                                        disabled
                                        className='TextInput question'
                                        value={question}
                                        onChange={handleUpdateQuestion}
                                        placeholder={
                                            !('building' in session)
                                                ? 'First select a category and a tag'
                                                : 'Enter your location...'
                                        }
                                    />
                                )}
                        </div>
                        <div className='addButtonWrapper'>
                            {stage > LOCATION_INPUTTED ||
                            primaryTags.length === 0 ||
                            secondaryTags.length === 0 ? (
                                    <p
                                        className='AddButton active'
                                        onClick={() => handleJoinClick()}
                                    >
                                    Add My Question
                                    </p>
                                ) : (
                                    <p className='AddButton'> Add My Question </p>
                                )}
                        </div>
                    </div>
                </div>
            )}
            {stage === CLOSE_TO_END_OF_OH && (
                <SessionAlertModal
                    header={'Warning'}
                    icon={'exclamation'}
                    color={'yellow'}
                    description={
                        'This session ends at ' +
                        moment(session.endTime.seconds * 1000).format(
                            'h:mm A'
                        ) +
                        '. Consider adding yourself to a later queue.'
                    }
                    buttons={['Cancel Question', 'Add Anyway']}
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
