import * as React from 'react';
import { Icon, Loader, Button } from 'semantic-ui-react';
import Moment from 'react-moment';
import { useState } from "react";
// @ts-ignore (Note that this library does not provide typescript)
import Linkify from 'linkifyjs/react';
import addNotification from 'react-push-notification';
import SelectedTags from './SelectedTags';

import { firestore } from '../../firebase';
import {
    markStudentNoShow,
    retractStudentQuestion,
    assignQuestionToTA,
    markQuestionDone,
    markQuestionDontKnow,
    updateComment
} from '../../firebasefunctions/sessionQuestion';

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
};

type State = {
    showLocation: boolean;
    location: string;
    isEditingLocation: boolean;
    showDotMenu: boolean;
    undoQuestionIdDontKnow?: number;
    undoName?: string;
    enableEditingComment: boolean;
    width: number;
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
            enableEditingComment: false,
            width: window.innerWidth
        };
    }

    componentDidUpdate(prevProps: Props) {
        const previousState = prevProps.question;
        const currentState = this.props.question;
        const user = this.props.myUserId;
        if (previousState.taComment !== currentState.taComment && user === currentState.askerId) {
            try {
                addNotification({
                    title: 'TA comment',
                    subtitle: 'New TA comment',
                    message: `${currentState.taComment}`,
                    theme: "darkblue",
                    native: true
                });
            } catch (error) {
                // TODO(ewlsh): Handle this better, this notification library doesn't handle iOS
            }
        }

        if (previousState.studentComment !== currentState.studentComment && user === currentState.answererId) {
            try {
                addNotification({
                    title: 'Student comment',
                    subtitle: 'New student comment',
                    message: `${currentState.studentComment}`,
                    theme: "darkblue",
                    native: true
                });
            } catch (error) {
                // TODO(ewlsh): Handle this better, this notification library doesn't handle iOS
            }
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
        this.props.setShowModal(true);
        this.props.setRemoveQuestionId(this.props.question.questionId);
    }

    retractQuestion = (): void => {
        retractStudentQuestion(firestore, this.props.question)
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
        markStudentNoShow(firestore, this.props.question)
    };

    questionDone = () => {
        markQuestionDone(firestore, this.props.question)
    };

    questionDontKnow = () => {
        markQuestionDontKnow(firestore, this.props.question)
    };

    questionComment = (newComment: string, isTA: boolean) => {
        updateComment(firestore, this.props.question, newComment, isTA)
    };

    toggleComment = () => {
        this.setState(({ enableEditingComment }) =>
            ({ enableEditingComment: !enableEditingComment }));
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
        const answerer = question.answererId
            ? this.props.users[question.answererId] : undefined;
        const user = this.props.user;
        const primaryTag = this.props.question.primaryTag
            ? this.props.tags[this.props.question.primaryTag] : undefined;
        const secondaryTag = this.props.question.secondaryTag
            ? this.props.tags[this.props.question.secondaryTag] : undefined;

        const comment = this.props.isTA ? question.taComment : question.studentComment;

        return (
            <div className="QueueQuestions">
                <div className="TopBar">
                    {!this.props.includeRemove && includeBookmark && <div className="Bookmark" />}
                    <div>
                        <p className={'Order ' + (question.status === 'assigned' ? 'assigned' : '')}>
                            {question.status === 'assigned' ? '•••' : this.getDisplayText(this.props.index)}
                        </p>
                    </div>
                    {this.props.includeRemove && !['virtual', 'review'].includes(this.props.modality) &&
                        <div className="LocationPin">
                            <Icon
                                onClick={this.toggleLocationTooltip}
                                name="map marker alternate"
                            />
                            <div
                                className="LocationTooltip"
                                style={{ visibility: this.state.showLocation ? 'visible' : 'hidden' }}
                            >
                                <p>
                                    Location &nbsp; <span
                                        className={'characterCount ' +
                                            (this.state.location.length >= 40 ? 'warn' : '')}
                                    >
                                        {this.state.location.length}/{LOCATION_CHAR_LIMIT}
                                    </span>
                                </p>
                                <textarea
                                    className="TextInput question"
                                    value={this.state.location}
                                    onChange={(e) => this.handleUpdateLocation(e)}
                                />
                                {this.state.isEditingLocation ?
                                    <Loader
                                        className={'locationLoader'}
                                        active={true}
                                        inline={true}
                                        size={'tiny'}
                                    /> : <Icon name="check" />}
                                <div
                                    className="DoneButton"
                                    onClick={this.toggleLocationTooltip}
                                >
                                    Done
                                </div>
                            </div>
                        </div>
                    }
                    <div className="QuestionInfo">
                        {this.props.isTA && asker &&
                            <div className="studentInformation">
                                <img
                                    className="userInformationImg"
                                    src={asker.photoUrl || '/placeholder.png'}
                                    alt={asker ? `${asker.firstName} ${asker.lastName}` : 'unknown user'}
                                />
                                <span className="userInformationName">
                                    {asker.firstName + ' ' + asker.lastName +
                                        ' (' + asker.email.slice(0, asker.email.indexOf('@')) + ')'}
                                    {question.status === 'assigned' &&
                                        <>
                                            <span className="assigned"> is assigned
                                                {answerer &&
                                                    (' to ' + (answerer.userId === this.props.myUserId
                                                        ? 'you'
                                                        : answerer.firstName + ' '
                                                        + answerer.lastName))}
                                            </span>
                                        </>
                                    }
                                </span>
                            </div>
                        }
                        <div className="Location">
                            {
                                (
                                    <>{this.props.isTA &&
                                        question.location &&
                                        question.location.substr(0, 25) === 'https://cornell.zoom.us/j' &&
                                        <a href={question.location} target="_blank" rel="noopener noreferrer">
                                            Zoom Link
                                        </a>
                                    }
                                    {this.props.isTA &&
                                            question.location &&
                                            question.location.substr(0, 25) !== 'https://cornell.zoom.us/j' &&
                                            question.location
                                    }</>)}
                        </div>
                        {(this.props.isTA || includeBookmark || this.props.includeRemove) &&
                            <p className={'Question' + studentCSS}>{question.content}</p>}
                    </div>
                    <div className="RightBar">
                        <button className="commentBtn" onClick={this.toggleComment} type="button">
                            <Icon className="large" name="comment outline" />
                        </button>
                    </div>
                </div>
                {(question.studentComment || question.taComment) &&
                    <CommentBox
                        studentComment={question.studentComment}
                        taComment={question.taComment}
                        studentCSS={studentCSS}
                    />
                }
                <div className="BottomBar">
                    {this.props.isTA && <span className="Spacer" />}
                    <div className="Tags">
                        {primaryTag && <SelectedTags tag={primaryTag} isSelected={false} />}
                        {secondaryTag && <SelectedTags tag={secondaryTag} isSelected={false} />}
                    </div>
                    {question.timeEntered != null &&
                        <p className="Time">
                            posted at&nbsp;
                            {<Moment date={question.timeEntered.toDate()} interval={0} format={'hh:mm A'} />}
                        </p>}
                </div>
                {
                    this.props.isTA &&
                    <div className="Buttons">
                        <hr />
                        <div className="TAButtons">
                            {question.status === 'unresolved' &&
                                <p className="Begin" onClick={this.assignQuestion}>
                                    Assign to Me
                                </p>
                            }
                            {question.status === 'assigned' &&
                                <>
                                    <p className="Delete" onClick={this.studentNoShow}>No show</p>
                                    <p className="Done" onClick={this.questionDone}>Done</p>
                                    <p
                                        className="DotMenu"
                                        onClick={() => this.setDotMenu(!this.state.showDotMenu)}
                                    >
                                        ...
                                        {this.state.showDotMenu &&
                                            <div
                                                className="IReallyDontKnow"
                                                tabIndex={1}
                                                onClick={() => this.setDotMenu(false)}
                                            >
                                                <p
                                                    className="DontKnowButton"
                                                    onClick={this.questionDontKnow}
                                                >
                                                    I Really Don't Know
                                                </p>
                                            </div>
                                        }
                                    </p>
                                </>
                            }
                        </div>
                    </div>
                }
                {
                    this.state.enableEditingComment && <div className="CommentBox">
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
                                    enableEditingComment: false
                                });
                            }}
                            onCancel={() => {
                                // Disable editing comment
                                this.setState({
                                    enableEditingComment: false
                                });
                            }}
                            initComment={comment || ""}
                        />
                    </div>
                }

                {
                    question.answererLocation && this.state.width < MOBILE_BREAKPOINT && <>
                        <Button className="JoinButton" target="_blank" href={question.answererLocation}>
                            Join Session
                        </Button>
                    </>
                }

                {
                    this.props.includeRemove && !this.props.isPast &&
                    <div className="Buttons">
                        <hr />
                        <p className="Remove" onClick={this.onClickRemove}>
                            <Icon name="close" /> Remove
                        </p>
                    </div>
                }
            </div >
        );
    }
}

type EditCommentProps = {
    readonly initComment: string;
    readonly onValueChange: Function;
    readonly onCancel: Function;
}

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
                    onChange={(evt) => { setComment(evt.target.value) }}
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
                {comment !== "" && comment !== undefined ? comment : "Add a comment..."}
            </Linkify>
            <button
                type="button"
                className="link-button commentEdit"
                onClick={(evt) => {
                    evt.preventDefault();
                    setPrevComment(comment);
                    setEditable(true);
                }}
            >
                edit
            </button>
        </div>
    );

}

type CommentBoxProps = {
    readonly studentComment?: string;
    readonly taComment?: string;
    readonly studentCSS?: string;
}

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
    )
}

export default SessionQuestion;
