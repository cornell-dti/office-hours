import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router';
import { Icon } from 'semantic-ui-react';
import moment from 'moment';

import SelectedTags from './SelectedTags';
import SessionAlertModal from './SessionAlertModal';

import { collectionData, firestore, auth } from '../../firebase';
import { addQuestion } from '../../firebasefunctions/sessionQuestion';

const LOCATION_CHAR_LIMIT = 40;
const WARNING_THRESHOLD = 10; // minutes left in queue

type Props = {
    session: FireSession;
    course: FireCourse;
    mobileBreakpoint: number;
};


const AddQuestion = (
    { course, session, mobileBreakpoint }: Props
) => {
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
    const [stage, setStage] = useState<number>(10);
    const [width, setWidth] = useState<number>(window.innerWidth);
    const [selectedPrimary, setSelectedPrimary] = useState<FireTag>();
    const [selectedSecondary, setSelectedSecondary] = useState<FireTag>();
    const [redirect, setRedirect] = useState<boolean>(false);
    const [tags, setTags] = useState<FireTag[]>([]);

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
                setStage(10);
                setSelectedPrimary(undefined);
                setSelectedSecondary(undefined);
            } else {
                setStage(20);
                setSelectedPrimary(tag);
                setSelectedSecondary(undefined);
            }
        } else if (stage <= 10) {
            setStage(20);
            setSelectedPrimary(tag);
        } else {
            setStage(10);
            setSelectedPrimary(undefined);
            setSelectedSecondary(undefined);
        }

    };

    const handleSecondarySelected = (tag: FireTag): void => {
        if (selectedSecondary) {
            setLocation('');
            setQuestion('');
            if (selectedSecondary.tagId === tag.tagId) {
                setStage(20);
                setSelectedSecondary(undefined);
            } else {
                !('building' in session) ? setStage(40) : setStage(30);
                setSelectedSecondary(tag);
            }
        } else if (!('building' in session)) {
            setStage(40);
            setSelectedSecondary(tag);
        } else {
            setStage(30);
            setSelectedSecondary(tag);
        }
    };

    const handleUpdateLocation = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const target = event.target as HTMLTextAreaElement;
        let newStage: number;
        if (target.value.length > 0) {
            if (question.length > 0) {
                newStage = 50;
            } else { newStage = 40; }
        } else { newStage = 30; }


        if (session.modality === 'in-person') {
            setLocation(target.value.length <= LOCATION_CHAR_LIMIT ? target.value : location);
            setStage(newStage)
        } else {
            setLocation(target.value)
            setStage(newStage);
        }
    };

    const handleUpdateQuestion = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const target = event.target as HTMLTextAreaElement;
        setQuestion(target.value.length <= course.charLimit ? target.value : question)
        setStage(target.value.length > 0 ? 50 : 40);
    };

    const addNewQuestion = () => {
        const allowRedirect = addQuestion(
            auth.currentUser,
            session,
            firestore,
            location,
            selectedPrimary,
            selectedSecondary,
            question)

        setRedirect(allowRedirect)
    };

    const handleJoinClick = (): void => {
        if (stage !== 60 &&
            (moment().add(WARNING_THRESHOLD, 'minutes')).isAfter(session.endTime.seconds * 1000)) {
            setStage(60);
        } else {
            addNewQuestion();
        }
    };

    const handleKeyPressDown = (event: React.KeyboardEvent<HTMLElement>) => {
        // CTRL + ENTER or CMD + ENTER adds the question ONLY if cursor in Question textbox
        if ((!event.repeat && (event.ctrlKey || event.metaKey) && event.keyCode === 13 && stage > 40)) {
            addNewQuestion();
        } else if (!event.repeat && event.keyCode === 27) {
            handleXClick();
        }
    };


    if (redirect) {
        return (
            <Redirect
                push={true}
                to={'/course/' + course.courseId + '/session/' + session.sessionId}
            />
        );
    }

    return (
        <div className="QuestionView" onKeyDown={(e) => handleKeyPressDown(e)} >
            {(stage < 60 || width < mobileBreakpoint) &&
                <div className="AddQuestion">
                    <div className="queueHeader">
                        <p className="title">Join The Queue</p>
                    </div>
                    <div className="tagsContainer">
                        <hr />
                        <div className="tagsMiniContainer">
                            <p className="header">Select a Category</p>
                            <div className="QuestionTags">
                                {tags
                                    .filter((tag) => tag.active && tag.level === 1)
                                    .map((tag) => (<SelectedTags
                                        key={tag.tagId}
                                        tag={tag}
                                        isSelected={stage > 10}
                                        onClick={() => handlePrimarySelected(tag)}
                                        check={tag.name === selectedPrimary?.name}
                                        isPrimary={true}
                                        select={true}
                                    />)
                                    )
                                }
                            </div>
                        </div>
                        <hr />
                        <div className={'tagsMiniContainer secondaryTags ' + (!!selectedPrimary)}>
                            <p className="header">Select a Tag</p>
                            {selectedPrimary ?
                                tags
                                    .filter((tag) => tag.active && tag.level === 2)
                                    .filter((tag) => (tag.parentTag === selectedPrimary.tagId))
                                    .map((tag) => (<SelectedTags
                                        key={tag.tagId}
                                        tag={tag}
                                        isSelected={selectedSecondary === tag}
                                        onClick={() => handleSecondarySelected(tag)}
                                        check={tag.name === selectedSecondary?.name}
                                        select={true}
                                    />))
                                : <p className="placeHolder">First select a category</p>}
                        </div>
                        <hr />
                        {'building' in session && <> <div className="tagsMiniContainer">
                            {<p className="header">
                                Location or Zoom Link &nbsp;{
                                    session.modality === 'in-person' && <span
                                        className={
                                            'characterCount ' +
                                            (location.length >= LOCATION_CHAR_LIMIT ? 'warn' : '')
                                        }
                                    >
                                        (
                                        {LOCATION_CHAR_LIMIT - location.length}
                                        {' '}
                                    character{LOCATION_CHAR_LIMIT - location.length !== 1 && 's'} left
                                    )
                                    </span>}
                            </p>}
                            {stage >= 30 ?
                                <div className="locationInput">
                                    <Icon name="map marker alternate" />
                                    <textarea
                                        className="TextInput location"
                                        value={location}
                                        onChange={handleUpdateLocation}
                                        placeholder="What is your zoom link?"
                                    />
                                </div>
                                : <p className="placeHolder text">Finish selecting tags...</p>}
                        </div>
                        <hr /></>}
                        <div className="tagsMiniContainer">
                            <p className="header">
                                {'Question '}
                            </p>
                            {stage >= 40 ?
                                <textarea
                                    className="TextInput question"
                                    value={question}
                                    onChange={handleUpdateQuestion}
                                    placeholder="What's your question about?"
                                />
                                : <textarea
                                    disabled
                                    className="TextInput question"
                                    value={question}
                                    onChange={handleUpdateQuestion}
                                    placeholder={
                                        !('building' in session)
                                            ? "First select a category and a tag" : "Enter your location..."
                                    }
                                />}

                        </div>
                        <div className="addButtonWrapper">
                            {stage > 40 ?
                                <p className="AddButton active" onClick={() => handleJoinClick()} >
                                    Add My Question
                                </p>
                                : <p className="AddButton"> Add My Question </p>
                            }
                        </div>
                    </div>
                </div>}
            {stage === 60 &&
                <SessionAlertModal
                    header={'Warning'}
                    icon={'exclamation'}
                    color={'yellow'}
                    description={'This session ends at '
                        + moment(session.endTime.seconds * 1000).format('h:mm A')
                        + '. Consider adding yourself to a later queue.'}
                    buttons={['Cancel Question', 'Add Anyway']}
                    cancelAction={handleXClick}
                    course={course}
                    mainAction={() => handleJoinClick()}
                    displayShade={width < mobileBreakpoint}
                />
            }
        </div>
    );

};

export default AddQuestion;
