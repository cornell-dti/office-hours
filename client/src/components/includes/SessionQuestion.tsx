import React, { useState } from 'react';
import { Icon, Loader } from 'semantic-ui-react';
import Moment from 'react-moment';

import { useUser, useQuestionTags, useTagsFromIds } from '../../firestoreHooks';
import SelectedTags from './SelectedTags';

const LOCATION_CHAR_LIMIT = 40;

// Given an index from [1..n], converts it to text that is displayed on the
// question cards. 1 => "NOW", 2 => "2nd", 3 => "3rd", and so on.
const getDisplayText = (index: number): string => {
    index++;
    // Disclaimer: none of us wrote this one-line magic :) It is borrowed
    // from https://stackoverflow.com/revisions/39466341/5 return index +
    // ['st', 'nd', 'rd'][((index + 90) % 100 - 10) % 10 - 1] || index +
    // 'th';
    return String(index);
};

const handleUpdateLocation = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    setLocation: Function,
    setIsEditingLocation: Function,
): void => {
    setIsEditingLocation(true);
    const target = event.target as HTMLTextAreaElement;
    if (target.value.length <= LOCATION_CHAR_LIMIT) {
        setLocation(target.value);
        alert('UpdateLocation');
        // updateLocation({
        //     variables: {
        //         id: props.question.id,
        //         location: target.value,
        //     }
        // });
        setTimeout(() => { setIsEditingLocation(false); }, 100);
    }
};

const _onClick = (event: React.MouseEvent<HTMLElement>, status: string, question: FireQuestion) => {
    alert('_onClick');
    // triggerUndo(question.id, status, question.userByAskerId.computedName);
};

// const triggerUndoDontKnow = (id: number, name: string, setUndoIdDontKnow: Function, setUndoName: Function) => {
//     setUndoIdDontKnow(id);
//     setUndoName(name);
// }

const handleUndoDontKnow = (id: string) => {
    alert(`handleUndoDontKnow: ${id}`);
    // UndoDontKnow({
    //     variables: {
    //         id: id,
    //         status: 'unresolved'
    //     }
    // });
};

const SessionQuestion = (props: {
    question: FireQuestion;
    index: number;
    isTA: boolean;
    includeRemove: boolean;
    includeBookmark: boolean;
    myUserId: string;
    triggerUndo: Function;
    isPast: boolean;
}) => {
    const { question } = props;

    const [showLocation, setShowLocation] = useState(false);
    const [location, setLocation] = useState(props.question.location);
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [showDotMenu, setShowDotMenu] = useState(false);

    const asker = useUser(props.question.askerId);
    const answerer = useUser(props.question.answererId);

    const questionTags = useQuestionTags(question.id);
    const tags = useTagsFromIds(questionTags.map(qt => qt.tagId));

    // const [undoidDontKnow, setundoidDontKnow] = useState<number | undefined>(undefined);
    // const [undoName, setUndoName] = useState<string | undefined>(undefined);

    const studentCSS = props.isTA ? '' : ' Student';

    return (
        <div className="QueueQuestions">
            {props.includeBookmark && <div className="Bookmark" />}
            <p className={`Order ${question.status === 'assigned' ? 'assigned' : ''}`}>
                {question.status === 'assigned' ? '•••' : getDisplayText(props.index)}
            </p>
            {props.includeRemove
                && <div className="LocationPin">
                    <Icon onClick={setShowLocation(!showLocation)} name="map marker alternate" />
                    <div
                        className="LocationTooltip"
                        style={{ visibility: showLocation ? 'visible' : 'hidden' }}
                    >
                        <p>
                            Location &nbsp;
                            <span className={`characterCount ${location.length >= 40 ? 'warn' : ''}`}>
                                {location.length}
                                /
                                {LOCATION_CHAR_LIMIT}
                            </span>
                        </p>
                        <textarea
                            className="TextInput question"
                            value={location}
                            onChange={(e) => handleUpdateLocation(e, setLocation, setIsEditingLocation)}
                        />
                        {isEditingLocation
                            ? <Loader className="locationLoader" active inline size="tiny" />
                            : <Icon name="check" />}
                        <div className="DoneButton" onClick={() => setShowLocation(!showLocation)}> Done </div>
                    </div>
                    {showLocation && <div className="modalShade" />}
                   </div>
            }
            <div className="QuestionInfo">
                {props.isTA
                    && <div className="studentInformation">
                        <img src={asker && asker.photoUrl} />
                        <span className="Name">
                            {asker && (`${asker.firstName} ${asker.lastName}`)}
                            {question.status === 'assigned'
                                && <span className="assigned">
                                    {' '}
                                    is assigned
                                    {` to ${question.answererId === props.myUserId
                                        ? 'you'
                                        : answerer && (`${answerer.firstName} ${answerer.lastName}`)}`}
                                   </span>
                            }
                        </span>
                       </div>
                }
                <div className="Location">
                    {' '}
                    {props.isTA && question.location}
                    {' '}
                </div>
                {(props.isTA || props.includeBookmark || props.includeRemove)
                    && <p className={`Question${studentCSS}`}>{question.content}</p>}
            </div>
            <div className="BottomBar">
                {props.isTA && <span className="Spacer" />}
                <div className="Tags">
                    {tags.map((tag) => <SelectedTags
                        key={tag.id}
                        isSelected={false}
                        tag={tag.name}
                        level={tag.level}
                        onClick={null}
                    />)}
                </div>
                <p className="Time">
                    posted at&nbsp;
                    {<Moment date={question.timeEntered.seconds * 1000} interval={0} format="hh:mm A" />}
                </p>
            </div>
            {props.isTA
                && <div className="Buttons">
                    <hr />
                    <div className="TAButtons">
                        {question.status === 'unresolved'
                            && <p className="Begin" onClick={(e) => _onClick(e, 'assigned', question)}> Assign to Me </p>
                        }
                        {question.status === 'assigned'
                            && (
                                <React.Fragment>
                                    <p className="Delete" onClick={(e) => _onClick(e, 'no-show', question)}>
                                        No show
                                    </p>
                                    <p className="Done" onClick={(e) => _onClick(e, 'resolved', question)}> Done </p>
                                    <p className="DotMenu" onClick={() => setShowDotMenu(!showDotMenu)}>
                                        ...
                                        {showDotMenu && (
                                            <div
                                                className="IReallyDontKnow"
                                                tabIndex={1}
                                                onClick={() => setShowDotMenu(false)}
                                            >
                                                <p
                                                    className="DontKnowButton"
                                                    onClick={() => handleUndoDontKnow(question.id)}
                                                >
                                                    {"I Really Don't Know"}
                                                </p>
                                            </div>
                                        )}
                                    </p>
                                </React.Fragment>
                            )
                        }
                    </div>
                   </div>
            }
            {props.includeRemove && !props.includeBookmark && !props.isPast
                && <div className="Buttons">
                    <hr />
                    <p className="Remove" onClick={(e) => _onClick(e, 'retracted', question)}>
                        <Icon name="close" />
                        {' '}
                        Remove
                    </p>
                   </div>
            }
        </div>
    );
};

export default SessionQuestion;
