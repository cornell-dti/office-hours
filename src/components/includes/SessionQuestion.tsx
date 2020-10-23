import * as React from 'react';
import { Icon, Loader, Button } from 'semantic-ui-react';
import Moment from 'react-moment';
import * as firebase from 'firebase/app';
import { firestore } from '../../firebase';
import SelectedTags from './SelectedTags';

// TODO_ADD_SERVER_CHECK
const LOCATION_CHAR_LIMIT = 40;

type Props = {
    question: FireQuestion;
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
};

type State = {
    showLocation: boolean;
    location: string;
    isEditingLocation: boolean;
    showDotMenu: boolean;
    undoQuestionIdDontKnow?: number;
    undoName?: string;
};

const FEATURE_TA_COMMENT_ENABLE_FLAG = localStorage.getItem('FEATURE_TA_COMMENT_ENABLE_FLAG') === 'true';

class SessionQuestion extends React.Component<Props, State> {
    state: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            showLocation: false,
            location: props.question.location || '',
            isEditingLocation: false,
            showDotMenu: false
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

    retractQuestion = (): void => {
        const batch = firestore.batch();
        const slotUpdate: Partial<FireQuestionSlot> = { status: 'retracted' };
        const questionUpdate: Partial<FireQuestion> = slotUpdate;
        batch.update(firestore.doc(`questionSlots/${this.props.question.questionId}`), slotUpdate);
        batch.update(firestore.doc(`questions/${this.props.question.questionId}`), questionUpdate);
        batch.commit();
    };

    toggleLocationTooltip = () => {
        this.setState(({ showLocation }) => ({ showLocation: !showLocation }));
    };

    assignQuestion = () => {
        const batch = firestore.batch();
        const slotUpdate: Partial<FireQuestionSlot> = { status: 'assigned' };
        const questionUpdate: Partial<FireQuestion> = {
            status: 'assigned',
            answererId: this.props.myUserId,
            ...(this.props.virtualLocation ? { answererLocation: this.props.virtualLocation } : {})
        };
        batch.update(firestore.doc(`questionSlots/${this.props.question.questionId}`), slotUpdate);
        batch.update(firestore.doc(`questions/${this.props.question.questionId}`), questionUpdate);
        batch.commit();
    };

    studentNoShow = () => {
        const batch = firestore.batch();
        const slotUpdate: Partial<FireQuestionSlot> = { status: 'no-show' };
        const questionUpdate: Partial<FireQuestion> = slotUpdate;
        batch.update(firestore.doc(`questionSlots/${this.props.question.questionId}`), slotUpdate);
        batch.update(firestore.doc(`questions/${this.props.question.questionId}`), questionUpdate);
        batch.commit();
    };

    questionDone = () => {
        const batch = firestore.batch();
        const slotUpdate: Partial<FireQuestionSlot> = { status: 'resolved' };
        const questionUpdate: Partial<FireQuestion> = {
            status: 'resolved',
            timeAddressed: firebase.firestore.Timestamp.now()
        };
        batch.update(firestore.doc(`questionSlots/${this.props.question.questionId}`), slotUpdate);
        batch.update(firestore.doc(`questions/${this.props.question.questionId}`), questionUpdate);
        batch.commit();
    };

    questionComment = () => {
        const taComment = prompt('Your comment', this.props.question.taComment);
        if (taComment == null) {
            return;
        }
        const update: Partial<FireQuestion> = { taComment };
        firestore.doc(`questions/${this.props.question.questionId}`).update(update);
    };

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

    questionDontKnow = () => {
        const batch = firestore.batch();
        const slotUpdate: Partial<FireQuestionSlot> = { status: 'unresolved' };
        const questionUpdate: Partial<FireQuestion> = { status: 'unresolved', answererId: '' };
        batch.update(firestore.doc(`questionSlots/${this.props.question.questionId}`), slotUpdate);
        batch.update(firestore.doc(`questions/${this.props.question.questionId}`), questionUpdate);
        batch.commit();
    };

    render() {
        const question = this.props.question;
        const studentCSS = this.props.isTA ? '' : ' Student';
        const includeBookmark = this.props.question.askerId === this.props.myUserId;

        const asker = this.props.users[question.askerId];
        const answerer = question.answererId
            ? this.props.users[question.answererId] : undefined;
        const primaryTag = this.props.question.primaryTag
            ? this.props.tags[this.props.question.primaryTag] : undefined;
        const secondaryTag = this.props.question.secondaryTag
            ? this.props.tags[this.props.question.secondaryTag] : undefined;

        return (
            <div className="QueueQuestions">
                {!this.props.includeRemove && includeBookmark && <div className="Bookmark" />}
                <p className={'Order ' + (question.status === 'assigned' ? 'assigned' : '')}>
                    {question.status === 'assigned' ? '•••' : this.getDisplayText(this.props.index)}
                </p>
                {this.props.includeRemove && this.props.modality !== 'virtual' &&
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
                                src={asker.photoUrl || '/placeholder.png'}
                                alt={asker ? `${asker.firstName} ${asker.lastName}` : 'unknown user'}
                            />
                            <span className="Name">
                                {asker.firstName + ' ' + asker.lastName + ' (' + asker.email.slice(0,asker.email.indexOf('@')) + ')'}
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
                    {question.taComment && (
                        <p className={'Question' + studentCSS}>TA Comment: {question.taComment}</p>
                    )}
                </div>
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
                                    {FEATURE_TA_COMMENT_ENABLE_FLAG && (
                                        <p className="Done" onClick={this.questionComment}>
                                            Edit Comment
                                        </p>
                                    )}
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
                    question.answererLocation  && <>
                        <Button className="JoinButton" target="_blank" href={question.answererLocation}>
                            Join Session
                        </Button>
                    </>
                }
                {
                    this.props.includeRemove && !this.props.isPast &&
                        <div className="Buttons">
                            <hr />
                            <p className="Remove" onClick={this.retractQuestion}>
                                <Icon name="close" /> Remove
                            </p>
                        </div>
                }
            </div >
        );
    }
}

export default SessionQuestion;
