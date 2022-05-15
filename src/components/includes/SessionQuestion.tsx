import * as React from 'react';
import { Icon, Button } from 'semantic-ui-react';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import notif from '../../media/notif.svg'
import SelectedTags from './SelectedTags';
import GreenCheck from '../../media/greenCheck.svg';
import { firestore } from '../../firebase';
import {
    markStudentNoShow,
    retractStudentQuestion,
    assignQuestionToTA,
    markQuestionDone,
    markQuestionDontKnow,
    updateComment,
    addComment,
    getComments,
    deleteComment,
    clearIndicator
} from '../../firebasefunctions/sessionQuestion';
import CommentsContainer from './CommentsContainer';
import { RootState } from '../../redux/store';
import CommentBubble from '../../media/chat_bubble.svg';

// TODO_ADD_SERVER_CHECK
const LOCATION_CHAR_LIMIT = 40;
const MOBILE_BREAKPOINT = 920;

type Props = {
    question: FireOHQuestion;
    users: { readonly [userId: string]: FireUser };
    commentUsers: { readonly [userId: string]: FireUser };
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
    showUndoPopup: boolean;
    showNoShowPopup: boolean;
    timeoutID: any;
    timeoutID2: any;
    undoQuestionIdDontKnow?: number;
    undoName?: string;
    enableEditingComment: boolean;
    width: number;
    comments: FireComment[];
    areCommentsVisible: boolean;
    showNewComment: boolean;
    retrieveCalled: boolean;
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
            comments: [],
            areCommentsVisible: false,
            showNewComment: true,
            retrieveCalled: false
        };
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
                location: target.value,
            });

            const question = firestore.collection('questions').doc(this.props.question.questionId);
            question.update({
                location: target.value,
            });

            setTimeout(() => {
                this.setState({
                    isEditingLocation: false,
                });
            }, 1000);
        }
    };

    onClickRemove = () => {
        this.props.setShowModal(true);
        this.props.setRemoveQuestionId(this.props.question.questionId);
    };

    retractQuestion = (): void => {
        retractStudentQuestion(firestore, this.props.question);
    };

    toggleLocationTooltip = () => {
        this.setState(({ showLocation }) => ({ showLocation: !showLocation }));
    };

    assignQuestion = () => {
        if (this.props.isPast) return;
        assignQuestionToTA(firestore, this.props.question, this.props.virtualLocation, this.props.myUserId);
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
    };

    questionComment = (newComment: string, isTA: boolean) => {
        updateComment(firestore, this.props.question, newComment, isTA);
    };

    toggleComment = () => {
        this.setState(({ enableEditingComment }) => ({
            enableEditingComment: !enableEditingComment,
        }));
    };

    _onClick = (event: React.MouseEvent<HTMLElement>, updateQuestion: Function, status: string) => {
        updateQuestion({
            variables: {
                questionId: this.props.question.questionId,
                status,
            },
        });
        const question = this.props.question;
        const asker = this.props.users[question.askerId];
        this.props.triggerUndo(question.questionId, status, asker.firstName + ' ' + asker.lastName);
    };

    setDotMenu = (status: boolean) => {
        this.setState({ showDotMenu: status });
    };

    setComments = (comments: FireComment[]) => {
        this.setState({comments : [...comments]});
    }

    retrieveComments = async (questionId: string) => {
        getComments(questionId, this.setComments);
        this.setState({retrieveCalled: true});
    }

    deleteCommentsHelper = (commentId: string, questionId: string) => {
        deleteComment(commentId, questionId);
    }

    addCommentsHelper = (content: string) => {
        addComment(content, this.props.myUserId, this.props.question.questionId, 
            this.props.isTA, this.props.question.askerId, this.props.question.answererId);
    }

    switchCommentsVisible = () => {
        this.setState({areCommentsVisible: !this.state.areCommentsVisible});
    }

    handleReplyButton = () => {
        clearIndicator(this.props.question, this.props.isTA);
        if (this.props.isPast) return;
        if (this.state.areCommentsVisible) {
            this.setState({
                areCommentsVisible: false
            });
        } else {
            this.setState({
                areCommentsVisible: true,
                showNewComment: true
            })
        }
    }

    switchNewComment = () => {
        this.setState({
            showNewComment: !this.state.showNewComment
        });
    }

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

        if (this.state.retrieveCalled === false) {
            this.retrieveComments(question.questionId);
        }
        return (
            <div className="questionWrapper">
                <div className="QueueQuestions">
                    <div className="TopBar">
                        {!this.props.includeRemove && includeBookmark && <div className="Bookmark" />}
                        <div>
                            <p className={'Order ' + (question.status === 'assigned' ? 'assigned' : '')}>
                                {question.status === 'assigned' ? '•••' : this.getDisplayText(this.props.index)}
                            </p>
                        </div>
                        {this.props.includeRemove && !['virtual', 'review'].includes(this.props.modality) && 
                     (
                         <div className="LocationPin">
                             <Icon onClick={this.toggleLocationTooltip} name="map marker alternate" size='large'/>
                             <div
                                 className="LocationTooltip"
                                 style={{
                                     visibility: this.state.showLocation ? 'visible' : 'hidden',
                                 }}
                             >
                                 <p>
                                    Edit Location &nbsp;{' '}
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
                                 <Icon name="check" onClick={this.toggleLocationTooltip}/>
                             </div>
                         </div>
                     )}
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
                            {!this.props.isTA && user &&
                                <div className="studentInformation">
                                    <img
                                        className="userInformationImg"
                                        src={user.photoUrl || '/placeholder.png'}
                                        alt={user ? `${user.firstName} ${user.lastName}` : 'unknown user'}
                                    />
                                    <span className="userInformationName">
                                        {user.firstName + ' ' + user.lastName +
                                        ' (You)'}
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
                                                (<div className="taLocationInfo">
                                                    <Icon name="map marker alternate" size='small'/>
                                                    <p>{question.location}</p> 
                                                </div>)
                                        }</>)}
                            </div>
                        </div>
                        <div className="RightBar">
                            <div className="Tags">
                                {primaryTag && <SelectedTags tag={primaryTag} isSelected={false} />}
                                {secondaryTag && <SelectedTags tag={secondaryTag} isSelected={false} />}
                            </div>
                            {question.timeEntered != null &&
                                <p className="Time">
                                    {<Moment date={question.timeEntered.toDate()} interval={0} format={'hh:mm A'} />}
                                </p>}
                        </div>
                    </div>
                    {(this.props.isTA || includeBookmark || this.props.includeRemove) &&
                                <p className={'Question' + studentCSS}>{question.content}</p>}
                    {
                        this.props.isTA &&
                        <div className="Buttons">
                            <hr />
                            <div className="buttonsWrapper">
                                <div className="replyButton">
                                    {!this.state.areCommentsVisible && question.taNew && <img 
                                        className="indicator" 
                                        src={notif} 
                                        alt="Notification indicator" 
                                    />}
                                    <img 
                                        className="replyIcon" 
                                        src={CommentBubble} 
                                        alt="Reply icon" 
                                        onClick={this.handleReplyButton}
                                    />
                                </div>
                                <div className="TAButtons">
                                    {question.status === 'unresolved' ?
                                        <p className="Begin" onClick={this.assignQuestion}>
                                            Assign to me
                                        </p>
                                        :
                                        <p className="Begin" onClick={this.questionDontKnow}>
                                            Unassign from me
                                        </p>
                                    }
                                </div>
                                <div className="assignedButtons">
                                    {question.status === 'assigned' &&
                                        <>
                                            <button
                                                className="Delete"
                                                onClick={this.studentNoShow} 
                                                type="button"
                                            >No show</button>
                                            <button
                                                className="Done"
                                                onClick={this.questionDone} 
                                                type="button"
                                            >Done</button>
                                        </>
                                    }
                                </div>
                            </div>
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
                            <div className="studentButtons">
                                <p className="Remove" onClick={this.onClickRemove}>
                                    Remove
                                </p>
                                <div className="replyButton">
                                    {!this.state.areCommentsVisible && question.studentNew && <img 
                                        className="indicator" 
                                        src={notif} 
                                        alt="Notification indicator" 
                                    />}
                                    <img 
                                        className="replyIcon" 
                                        src={CommentBubble} 
                                        alt="Reply icon" 
                                        onClick={this.handleReplyButton}
                                    />
                                </div>
                            </div>

                        </div>
                    }
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
                </div >
                {
                    this.state.areCommentsVisible ?
                        < CommentsContainer
                            comments={this.state.comments}
                            users={this.props.commentUsers}
                            currentUser={this.props.user}
                            addCommentsHelper={this.addCommentsHelper}
                            questionId={question.questionId}
                            switchCommentsVisible={this.switchCommentsVisible}
                            deleteCommentsHelper={this.deleteCommentsHelper}
                            showNewComment={this.state.showNewComment}
                            isPast={this.props.isPast}
                        /> :
                        <></>
                }
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    user : state.auth.user
})


export default connect(mapStateToProps, {})(SessionQuestion);