import * as React from 'react';
import { Icon, Loader, Button } from 'semantic-ui-react';
import Moment from 'react-moment';
import { useState } from "react";
// @ts-ignore (Note that this library does not provide typescript)
import Linkify from 'linkifyjs/react';
import { connect } from 'react-redux';
import SelectedTags from './SelectedTags';
import GreenCheck from '../../media/greenCheck.svg';

import { firestore } from '../../firebase';
import {
    markStudentNoShow,
    retractStudentQuestion,
    assignQuestionToTA,
    markQuestionDone,
    markQuestionDontKnow,
    updateComment
} from '../../firebasefunctions/sessionQuestion';
import { RootState } from '../../redux/store';

// TODO_ADD_SERVER_CHECK
const LOCATION_CHAR_LIMIT = 40;
const MOBILE_BREAKPOINT = 920;

type Props = {
    question: FireOHQuestion;
    users: { readonly [userId: string]: FireUser };
    tags: { readonly [tagId: string]: FireTag };
    index: number;
    isTA: boolean;
    includeRemove: boolean;
    modality: FireSessionModality;
    myUserId: string;
    virtualLocation?: string;
    triggerUndo: Function;
    isPast: boolean;
    readonly user: FireUser;
    setShowModal: (show: boolean) => void;
    setRemoveQuestionId: (newId: string | undefined) => void;
    newQuestionAssigned: () => void;
    clearQuestionAssigned: () => void;
};

type State = {
    showLocation: boolean;
    location: string;
    isEditingLocation: boolean;
    showDotMenu: boolean;
    showUndoPopup: boolean;
    showNoShowPopup: boolean;
    timeoutID: any;
    timeoutID2: any;
    undoQuestionIdDontKnow?: number;
    undoName?: string;
    enableEditingComment: boolean;
    width: number;
    showCantRemove: boolean;
};


class SessionQuestion extends React.Component<Props, State> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            showLocation: false,
            location: props.question.location || '',
            isEditingLocation: false,
            showDotMenu: false,
            showUndoPopup: false,
            showNoShowPopup: false,
            timeoutID: 0,
            timeoutID2: 0,
            enableEditingComment: false,
            width: window.innerWidth,
            showCantRemove: false
        };
    }

    componentDidUpdate(prevProps: Props) {
        const previousState = prevProps.question;
        const currentState = this.props.question;

        if (previousState.status === 'unresolved' && currentState.status === 'assigned') {
            this.props.newQuestionAssigned();
        }
    }
    
    // Given an index from [1..n], converts it to text that is displayed on the
    // question cards. 1 => "NOW", 2 => "2nd", 3 => "3rd", and so on.
    getDisplayText(index: number): string {
        index++;
        // Disclaimer: none of us wrote this one-line magic :) It is borrowed
        // from https://stackoverflow.com/revisions/39466341/5 return index +
        // ['st', 'nd', 'rd'][((index + 90) % 100 - 10) % 10 - 1] || index +
        // 'th';
        return String(index);
    }


    public handleUpdateLocation = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        this.setState({ isEditingLocation: true });
        const target = event.target as HTMLTextAreaElement;
        if (target.value.length <= LOCATION_CHAR_LIMIT) {
            this.setState({
                location: target.value
            });

            const question = firestore.collection('questions').doc(this.props.question.questionId);
            question.update({
                location: target.value
            });

            setTimeout(() => {
                this.setState({
                    isEditingLocation: false
                });
            }, 1000);
        }
    };


    onClickRemove = () => {
        if (this.props.question.status === 'assigned') {
            this.setState({showCantRemove: true});
            return;
        }
        this.props.setShowModal(true);
        this.props.setRemoveQuestionId(this.props.question.questionId);
    }

    retractQuestion = (): void => {
        retractStudentQuestion(firestore, this.props.question);
    };

    toggleLocationTooltip = () => {
        this.setState(({ showLocation }) => ({ showLocation: !showLocation }));
    };

    assignQuestion = () => {
        assignQuestionToTA(
            firestore,
            this.props.question,
            this.props.virtualLocation,
            this.props.myUserId)
    };

    studentNoShow = () => {
        this.setState({
            showNoShowPopup: true,
        });

        const id = setTimeout(() => {
            this.setState({
                showNoShowPopup: false,
            });
            markStudentNoShow(firestore, this.props.question);
        }, 3000);

        this.setState({
            timeoutID2: id,
        });
        this.props.clearQuestionAssigned();
    };

    questionDone = () => {
        this.setState({
            showUndoPopup: true,
        });

        const id = setTimeout(() => {
            this.setState({
                showUndoPopup: false,
            });
            markQuestionDone(firestore, this.props.question);
        }, 3000);

        this.setState({
            timeoutID: id,
        });
        this.props.clearQuestionAssigned();
    };

    undoDone = () => {
        clearTimeout(this.state.timeoutID);
        this.setState({
            showUndoPopup: false,
            timeoutID: 0,
        });
        this.questionDontKnow();
    }

    undoNoShow = () => {
        clearTimeout(this.state.timeoutID2);
        this.setState({
            showNoShowPopup: false,
            timeoutID2: 0,
        });
        this.questionDontKnow();
    }

    questionDontKnow = () => {
        markQuestionDontKnow(firestore, this.props.question);
        this.props.clearQuestionAssigned();
    };

    questionComment = (newComment: string, isTA: boolean) => {
        updateComment(firestore, this.props.question, newComment, isTA);
    };

    toggleComment = () => {
        this.setState(({ enableEditingComment }) => ({ 
            enableEditingComment: !enableEditingComment 
        }));
    }

    _onClick = (event: React.MouseEvent<HTMLElement>, updateQuestion: Function, status: string) => {
        updateQuestion({
            variables: {
                questionId: this.props.question.questionId,
                status,
            }
        });
        const question = this.props.question;
        const asker = this.props.users[question.askerId];
        this.props.triggerUndo(
            question.questionId,
            status,
            asker.firstName + ' ' + asker.lastName
        );
    };

    setDotMenu = (status: boolean) => {
        this.setState({ showDotMenu: status });
    };


    render() {
        const question = this.props.question;
        const studentCSS = this.props.isTA ? '' : ' Student';
        const includeBookmark = this.props.question.askerId === this.props.myUserId;

        const asker = this.props.users[question.askerId];
        const answerer = question.answererId ? this.props.users[question.answererId] : undefined;
        const user = this.props.user;
        const primaryTag = this.props.question.primaryTag
            ? this.props.tags[this.props.question.primaryTag]
            : undefined;
        const secondaryTag = this.props.question.secondaryTag
            ? this.props.tags[this.props.question.secondaryTag]
            : undefined;

        const comment = this.props.isTA ? question.taComment : question.studentComment;

        return (
            <div className="QueueQuestions">
                <div className="TopBar">
                    {!this.props.includeRemove && includeBookmark && <div className="Bookmark" />}
                    <div className="OrderTooltip">
                        {!this.props.isTA && 
                            <span className="TooltipText">You are position {this.props.index + 1} in the queue.</span>
                        }
                        <p className={'Order ' + (question.status === 'assigned' ? 'assigned' : '')}>
                            {question.status === 'assigned' ? '•••' : this.getDisplayText(this.props.index)}
                        </p>
                    </div>
                    {this.props.includeRemove && !['virtual', 'review'].includes(this.props.modality) && 
                    (this.state.location.length > 0) && (
                        <div className="LocationPin">
                            <Icon onClick={this.toggleLocationTooltip} name="map marker alternate" />
                            <div
                                className="LocationTooltip"
                                style={{
                                    visibility: this.state.showLocation ? 'visible' : 'hidden',
                                }}
                            >
                                <p>
                                    Location &nbsp;{' '}
                                    <span
                                        className={
                                            'characterCount ' +
                                            (this.state.location.length >= 40 ? 'warn' : '')
                                        }
                                    >
                                        {this.state.location.length}/{LOCATION_CHAR_LIMIT}
                                    </span>
                                </p>
                                <textarea
                                    className="TextInput question"
                                    value={this.state.location}
                                    onChange={e => this.handleUpdateLocation(e)}
                                />
                                {this.state.isEditingLocation ? (
                                    <Loader
                                        className={'locationLoader'}
                                        active={true}
                                        inline={true}
                                        size={'tiny'}
                                    />
                                ) : (
                                    <Icon name="check" />
                                )}
                                <div className="DoneButton" onClick={this.toggleLocationTooltip}>
                                    Done
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="QuestionInfo">
                        {this.props.isTA && asker && (
                            <div className="studentInformation">
                                <img
                                    className="userInformationImg"
                                    src={asker.photoUrl || '/placeholder.png'}
                                    alt={asker ? `${asker.firstName} ${asker.lastName}` : 'unknown user'}
                                />
                                <span className="userInformationName">
                                    {asker.firstName +
                                        ' ' +
                                        asker.lastName +
                                        ' (' +
                                        asker.email.slice(0, asker.email.indexOf('@')) +
                                        ')'}
                                    {question.status === 'assigned' && (
                                        <>
                                            <span className="assigned">
                                                {' '}
                                                is assigned
                                                {answerer &&
                                                    ' to ' +
                                                    (answerer.userId === this.props.myUserId
                                                        ? 'you'
                                                        : answerer.firstName + ' ' + answerer.lastName)}
                                            </span>
                                        </>
                                    )}
                                </span>
                            </div>
                        )}
                        <div className="Location">
                            {this.props.isTA && this.props.modality === 'hybrid' && 
                            typeof this.props.question.isVirtual !== 'undefined' && 
                                <div className={`hybridBadge ${this.props.question.isVirtual ? 
                                    'virtual' : 'inPerson'}`}
                                >
                                    {this.props.question.isVirtual ? 'Virtual' : 'In-person'}
                                </div>
                            }
                            {
                                <div className="locationContent">
                                    {this.props.isTA &&
                                        question.location &&
                                        question.location.substr(0, 25) === 'https://cornell.zoom.us/j' && (
                                        <a
                                            href={question.location}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                                Zoom Link
                                        </a>
                                    )}
                                    {this.props.isTA &&
                                        question.location &&
                                        question.location.substr(0, 25) !== 'https://cornell.zoom.us/j' &&
                                        question.location}
                                </div>
                            }
                        </div>
                        {(this.props.isTA || includeBookmark || this.props.includeRemove) && (
                            <p className={'Question' + studentCSS}>{question.content}</p>
                        )}
                    </div>
                    <div className="RightBar">
                        <button className="commentBtn" onClick={this.toggleComment} type="button">
                            <Icon className="large" name="comment outline" />
                        </button>
                    </div>
                </div>
                {(question.studentComment || question.taComment) && (
                    <CommentBox
                        studentComment={question.studentComment}
                        taComment={question.taComment}
                        studentCSS={studentCSS}
                    />
                )}
                <div className="BottomBar">
                    {this.props.isTA && <span className="Spacer" />}
                    <div className="Tags">
                        {primaryTag && <SelectedTags tag={primaryTag} isSelected={false} />}
                        {secondaryTag && <SelectedTags tag={secondaryTag} isSelected={false} />}
                    </div>
                    {question.timeEntered != null && (
                        <p className="Time">
                            posted at&nbsp;
                            {<Moment date={question.timeEntered.toDate()} interval={0} format={'hh:mm A'} />}
                        </p>
                    )}
                </div>
                {this.props.isTA && (
                    <div className="Buttons">
                        <hr />
                        <div className="TAButtons">
                            {question.status === 'unresolved' && (
                                <p className="Begin" onClick={this.assignQuestion}>
                                    Assign to Me
                                </p>
                            )}
                            {question.status === 'assigned' && (
                                <>
                                    <p className="Delete" onClick={this.studentNoShow}>
                                        No show
                                    </p>
                                    {this.state.showNoShowPopup && (
                                        <div className="popup">
                                            <div className="popupContainer">
                                                <div className="resolvedQuestionBadge">
                                                    <img
                                                        className="resolvedCheckImage"
                                                        alt="Green check"
                                                        src={GreenCheck}
                                                    />
                                                    <p className="resolvedQuestionText">
                                                        Student Marked as No Show
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="Undo" onClick={this.undoNoShow}>
                                                Undo
                                            </p>
                                        </div>
                                    )}
                                    <p className="Done" onClick={this.questionDone}>
                                        Done
                                    </p>
                                    {this.state.showUndoPopup && (
                                        <div className="popup">
                                            <div className="popupContainer">
                                                <div className="resolvedQuestionBadge">
                                                    <img
                                                        className="resolvedCheckImage"
                                                        alt="Green check"
                                                        src={GreenCheck}
                                                    />
                                                    <p className="resolvedQuestionText">
                                                        Question Marked as Done
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="Undo" onClick={this.undoDone}>
                                                Undo
                                            </p>
                                        </div>
                                    )}
                                    <p
                                        className="DotMenu"
                                        onClick={() => this.setDotMenu(!this.state.showDotMenu)}
                                    >
                                        ...
                                        {this.state.showDotMenu && (
                                            <div
                                                className="IReallyDontKnow"
                                                tabIndex={1}
                                                onClick={() => this.setDotMenu(false)}
                                            >
                                                <p className="DontKnowButton" onClick={this.questionDontKnow}>
                                                    I Really Don't Know
                                                </p>
                                            </div>
                                        )}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )
                }
                {
                    this.state.enableEditingComment && (
                        <div className="CommentBox">
                            <div className="commentTopBar">
                                <img
                                    className="userInformationImg"
                                    src={user.photoUrl || '/placeholder.png'}
                                    alt={user ? `${user.firstName} ${user.lastName}` : 'unknown user'}
                                />
                                <span className="userInformationName">
                                    {user.firstName} {user.lastName}
                                </span>
                            </div>
                            <EditComment
                                onValueChange={(newComment: string) => {
                                    // Set a comment
                                    this.questionComment(newComment, this.props.isTA);
                                    // Disable editing comment
                                    this.setState({
                                        enableEditingComment: false,
                                    });
                                }}
                                onCancel={() => {
                                    // Disable editing comment
                                    this.setState({
                                        enableEditingComment: false,
                                    });
                                }}
                                initComment={comment || ''}
                            />
                        </div>
                    )
                }

                {
                    question.answererLocation && this.state.width < MOBILE_BREAKPOINT && (
                        <>
                            <Button className="JoinButton" target="_blank" href={question.answererLocation}>
                                Join Session
                            </Button>
                        </>
                    )
                }

                {
                    this.props.includeRemove && !this.props.isPast && (
                        <div className="buttonsAndCantRemove">
                            <div className="Buttons">
                                <hr />
                                <p className="Remove" onClick={this.onClickRemove}>
                                    <Icon name="close" /> Remove
                                </p>
                            </div>
                            {this.state.showCantRemove &&
                                <div className="cantRemove">
                                    Can't remove question when assigned!
                                </div>
                            }
                        </div>
                    )
                }
            </div >
        );
    }
}

type EditCommentProps = {
    readonly initComment: string;
    readonly onValueChange: Function;
    readonly onCancel: Function;
};

const EditComment = (props: EditCommentProps) => {
    const [editable, setEditable] = useState(false);
    const [comment, setComment] = useState(props.initComment);
    const [prevComment, setPrevComment] = useState(comment);

    if (editable) {
        return (
            <div className="commentBody">
                <textarea
                    placeholder="Add a comment..."
                    className="commentTextArea"
                    onChange={evt => {
                        setComment(evt.target.value);
                    }}
                    value={comment}
                />
                <div className="commentBtnHolder">
                    <button
                        type="button"
                        className="commentSaveBtn"
                        onClick={() => {
                            props.onValueChange(comment);
                            setPrevComment(comment);
                            setEditable(false);
                        }}
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        className="commentCancelBtn"
                        onClick={() => {
                            props.onCancel();
                            setComment(prevComment);
                            setEditable(false);
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // Not editable
    return (
        <div className="commentBody">
            <Linkify tagName="p">
                {comment !== '' && comment !== undefined ? comment : 'Add a comment...'}
            </Linkify>
            <button
                type="button"
                className="link-button commentEdit"
                onClick={evt => {
                    evt.preventDefault();
                    setPrevComment(comment);
                    setEditable(true);
                }}
            >
                edit
            </button>
        </div>
    );
};

type CommentBoxProps = {
    readonly studentComment?: string;
    readonly taComment?: string;
    readonly studentCSS?: string;
};

const CommentBox = (props: CommentBoxProps) => {
    return (
        <div className="CommentBox">
            {props.studentComment && (
                <Linkify className={'Question' + props.studentCSS} tagName="p">
                    Student Comment: {props.studentComment}
                </Linkify>
            )}
            {props.taComment && (
                <Linkify className={'Question' + props.studentCSS} tagName="p">
                    TA Comment: {props.taComment}
                </Linkify>
            )}
        </div>
    );
};

CommentBox.defaultProps = {
    studentComment: undefined,
    taComment: undefined,
    studentCSS: undefined,
};

const mapStateToProps = (state: RootState) => ({
    user : state.auth.user
})


export default connect(mapStateToProps, {})(SessionQuestion);