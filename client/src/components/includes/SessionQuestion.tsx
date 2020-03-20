/* eslint-disable @typescript-eslint/member-delimiter-style */
import * as React from 'react';
import { Icon, Loader } from 'semantic-ui-react';
import Moment from 'react-moment';
import { firestore } from '../../firebase';
import SelectedTags from './SelectedTags';
//This is used to make a timestamp
import * as firebase from 'firebase/app';

// import SelectedTags from './SelectedTags';

// const UPDATE_QUESTION = gql`
// mutation UpdateQuestion($questionId: Int!, $status: String) {
//     updateQuestionByQuestionId(input: {questionPatch: {status: $status}, questionId: $questionId}) {
//         clientMutationId
//     }
// }
// `;
// const UPDATE_LOCATION = gql`
// mutation UpdateLocation($questionId: Int!, $location: String) {
//     updateQuestionByQuestionId(input: {questionPatch: {location: $location}, questionId: $questionId}) {
//         clientMutationId
//     }
// }
// `;

// const UNDO_DONT_KNOW = gql`
// mutation UndoDontKnow($questionId: Int!, $status: String!) {
//     updateQuestionByQuestionId(input: {questionPatch: {status: $status, timeAddressed: null, answererId: null},
//         questionId: $questionId}) {
//         clientMutationId
//     }
// }
// `;

// TODO_ADD_SERVER_CHECK
const LOCATION_CHAR_LIMIT = 40;

type Props = {
    question: FireQuestion,
    index: number,
    isTA: boolean,
    includeRemove: boolean,
    myUserId: string,
    triggerUndo: Function,
    isPast: boolean,
};

type State = {
    showLocation: boolean,
    location: string,
    isEditingLocation: boolean,
    showDotMenu: boolean,
    undoQuestionIdDontKnow?: number,
    undoName?: string,
    //The loaded value of these variables
    asker?: FireUser | null,
    answerer?: FireUser | null,
    primaryTag?: FireTag | null,
    secondaryTag?: FireTag | null,
    //This is used for memoization so that we don't fetch the same
    //user information multiple times
    loadedAnswererId?: string | null,
    loadedAskerId?: string | null,
    loadedPrimaryTag?: string | null,
    loadedSecondaryTag?: string | null,
    loading: boolean
};

//We no longer support dynamic updating of asker, answer, tags etc

class SessionQuestion extends React.Component<Props> {
    state!: State;

    constructor(props: Props) {
        super(props);
        this.state = {
            showLocation: false,
            location: props.question.location || '',
            isEditingLocation: false,
            showDotMenu: false,
            //This code is used to load relevant information and cache it
            asker: null,
            answerer: null,
            primaryTag: null,
            secondaryTag: null,
            //This is used for memoization so that we don't fetch the same
            //user information multiple times
            loadedAnswererId: null,
            loadedAskerId: null,
            loadedPrimaryTag: null,
            loadedSecondaryTag: null,
            //Not currently loading these
            loading: false
        };

    }

    static getDerivedStateFromProps(props: Props, state: State) {
        //Assign null to these fields
        const stateChanges = {
            loadedPrimaryTag: state.loadedPrimaryTag,
            primaryTag: state.primaryTag,
            loadedAnswererId: state.loadedAnswererId,
            answerer: state.answerer,
            loadedSecondaryTag: state.loadedSecondaryTag,
            secondaryTag: state.secondaryTag,
            loadedAskerId: state.loadedAskerId,
            asker: state.asker,
            loading: state.loading
        };

        //Invalidate props when information is stale
        if (state.loadedPrimaryTag !== props.question.primaryTag){
            stateChanges.loadedPrimaryTag = props.question.primaryTag;
            stateChanges.primaryTag = null;
            stateChanges.loading = false;
        };

        if (state.loadedAnswererId !== props.question.answererId){
            stateChanges.loadedAnswererId = props.question.answererId;
            stateChanges.answerer = null;
            stateChanges.loading = false;
        };

        if (state.loadedSecondaryTag !== props.question.secondaryTag){
            stateChanges.loadedSecondaryTag = props.question.secondaryTag;
            stateChanges.secondaryTag = null;
            stateChanges.loading = false;
        };

        if (state.loadedAskerId !== props.question.askerId){
            stateChanges.loadedAskerId = props.question.askerId;
            stateChanges.asker = null;
            stateChanges.loading = false;
        };

        return {...state, ...stateChanges};
    }

    componentDidUpdate(props: Props, state: State) {
        let shouldUpdateLoad = false;
        //Make a get request for the asker if their information is invalidated
        if (!state.loading && state.asker === null){
            firestore.doc('users/' + state.loadedAskerId).get().then(
                (doc) => {
                    if (doc.exists){
                        this.setState({
                            asker: doc.data()
                        });
                    }
                }
            );
            shouldUpdateLoad = true;
        };
        //Make a get request for the answerer if their information is invalidated
        if (!state.loading && props.question.answererId && state.answerer === null){
            firestore.doc('users/' + state.loadedAnswererId).get().then(
                (doc) => {
                    if (doc.exists){
                        this.setState({
                            answerer: doc.data()
                        });
                    }
                }
            );
            shouldUpdateLoad = true;
        };
        //Make requests for the tags
        if (!state.loading && state.primaryTag === null){
            firestore.doc('tags/' + state.loadedPrimaryTag).get().then(
                (doc) => {
                    if (doc.exists){
                        this.setState({
                            primaryTag: doc.data()
                        });
                    }
                }
            );
            shouldUpdateLoad = true;
        }
        if (!state.loading && state.secondaryTag === null){
            firestore.doc('tags/' + state.loadedSecondaryTag).get().then(
                (doc) => {
                    if (doc.exists){
                        this.setState({
                            secondaryTag: doc.data()
                        });
                    }
                }
            );
            shouldUpdateLoad = true;
        }
        if (shouldUpdateLoad){
            this.setState({
                loading: true
            });
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

    handleQuestionStatus = (): void => {
        const question = firestore.collection('questions').doc(this.props.question.questionId);
        question.update({
            status: 'retracted'
        });
    };

    toggleLocationTooltip = () => {
        this.setState({
            showLocation: !this.state.showLocation
        });
    };

    assignQuestion = (event: React.MouseEvent<HTMLElement>) => {
        //Attempt to assign question to me
        firestore.doc(`questions/${this.props.question.questionId}`).update({
            status: 'assigned',
            answererId: this.props.myUserId
        });
    };

    //This function produces a no show
    studentNoShow = (event: React.MouseEvent<HTMLElement>) => {
        firestore.doc(`questions/${this.props.question.questionId}`).update({
            status: 'no-show',
            //This question has been "resolved" and will not show up again
            resolved: true
        });
    };

    //This function notes that a question has been done
    questionDone = (event: React.MouseEvent<HTMLElement>) => {
        firestore.doc(`questions/${this.props.question.questionId}`).update({
            status: 'resolved',
            timeAddressed: firebase.firestore.Timestamp.now(),
            //This question has been "resolved" and will not show up again
            resolved: true
        });
    };

    _onClick = (event: React.MouseEvent<HTMLElement>, updateQuestion: Function, status: string) => {
        updateQuestion({
            variables: {
                questionId: this.props.question.questionId,
                status: status,
            }
        });
        const question = this.props.question;
        this.props.triggerUndo(
            question.questionId,
            status,
            this.state.asker ? this.state.asker.firstName + ' ' + this.state.asker.lastName : 'unknown'
        );
    };

    setDotMenu = (status: boolean) => {
        this.setState({ showDotMenu: status });
    };

    handleUndoDontKnow = (questionId: number, UndoDontKnow: Function) => {
        UndoDontKnow({
            variables: {
                questionId: questionId,
                status: 'unresolved'
            }
        });
    };

    render() {
        const question = this.props.question;
        const studentCSS = this.props.isTA ? '' : ' Student';
        const includeBookmark = this.props.question.askerId === this.props.myUserId;

        return (
            <div className="QueueQuestions">
                {!this.props.includeRemove && includeBookmark && <div className="Bookmark" />}
                <p className={'Order ' + (question.status === 'assigned' ? 'assigned' : '')}>
                    {question.status === 'assigned' ? '•••' : this.getDisplayText(this.props.index)}
                </p>
                {this.props.includeRemove &&
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
                    {this.props.isTA && this.state.asker &&
                        <div className="studentInformation">
                            <img
                                src={this.state.asker === undefined
                                    ? '/placeholder.png'
                                    : this.state.asker.photoUrl}
                                alt={this.state.asker === undefined
                                    ? 'Asker profile picture'
                                    : `${this.state.asker.firstName} ${this.state.asker.lastName} profile picture`}
                            />
                            <span className="Name">
                                {this.state.asker.firstName + ' ' + this.state.asker.lastName}
                                {question.status === 'assigned' &&
                                    <React.Fragment>
                                        <span className="assigned"> is assigned
                                            {this.state.answerer &&
                                                (' to ' + (this.state.answerer.userId === this.props.myUserId
                                                    ? 'you'
                                                    : this.state.answerer.firstName + ' '
                                                    + this.state.answerer.lastName))}
                                        </span>
                                    </React.Fragment>
                                }
                            </span>
                        </div>
                    }
                    <div className="Location">
                        {this.props.isTA && question.location}
                    </div>
                    {(this.props.isTA || includeBookmark || this.props.includeRemove) &&
                        <p className={'Question' + studentCSS}>{question.content}</p>}
                </div>
                <div className="BottomBar">
                    {this.props.isTA && <span className="Spacer" />}
                    <div className="Tags">
                        {this.state.primaryTag && <SelectedTags
                            tag={this.state.primaryTag}
                            isSelected={false}
                        />}
                        {this.state.secondaryTag && <SelectedTags
                            tag={this.state.secondaryTag}
                            isSelected={false}
                        />}
                    </div>
                    {question.timeEntered != null &&
                        <p className="Time">
                            posted at&nbsp;
                            {<Moment date={question.timeEntered.toDate()} interval={0} format={'hh:mm A'} />}
                        </p>}
                </div>
                {this.props.isTA &&
                    <div className="Buttons">
                        <hr />
                        <div className="TAButtons">
                            {question.status === 'unresolved' &&
                                <p
                                    className="Begin"
                                    onClick = {
                                        //Assign question
                                        (e) => this.assignQuestion(e)
                                    }
                                >
                                    Assign to Me
                                </p>
                            }
                            {question.status === 'assigned' &&
                                <React.Fragment>
                                    <p
                                        className="Delete"
                                        onClick = {
                                            //No show
                                            (e) => this.studentNoShow(e)
                                        }
                                    >
                                        No show
                                    </p>
                                    <p
                                        className="Done"
                                        onClick = {
                                            //Done
                                            (e) => this.questionDone(e)
                                        }
                                    >
                                        Done
                                    </p>
                                    <p
                                        className="DotMenu"
                                    // onClick={() => this.setDotMenu(!this.state.showDotMenu)}
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
                                                // onClick={() => this.handleUndoDontKnow(
                                                //     question.questionId,
                                                //     UndoDontKnow
                                                // )}
                                                >
                                                    I Really Don't Know
                                                </p>
                                            </div>
                                        }
                                    </p>
                                </React.Fragment>
                            }
                        </div>
                    </div>
                }
                {this.props.includeRemove && !this.props.isPast &&
                    <div className="Buttons">
                        <hr />
                        <p
                            className="Remove"
                            onClick={() => this.handleQuestionStatus()}
                        >
                            <Icon name="close" /> Remove
                        </p>
                    </div>
                }
            </div>
        );
    }
}

export default SessionQuestion;
