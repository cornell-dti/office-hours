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
    users: { readonly[userId: string]: FireUser };
    tags: { readonly [tagId: string]: FireTag };
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
};

//We no longer support dynamic updating of asker, answer, tags etc

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

        const asker = this.props.users[question.askerId];
        const answerer = question.answererId ? undefined : this.props.users[question.answererId];
        const primaryTag = this.props.tags[this.props.question.primaryTag];
        const secondaryTag = this.props.tags[this.props.question.secondaryTag];

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
                    {this.props.isTA && asker &&
                        <div className="studentInformation">
                            <img
                                src={asker.photoUrl || '/placeholder.png'}
                                alt={asker ? `${asker.firstName} ${asker.lastName}` : 'unknown user'}
                            />
                            <span className="Name">
                                {asker.firstName + ' ' + asker.lastName}
                                {question.status === 'assigned' &&
                                    <React.Fragment>
                                        <span className="assigned"> is assigned
                                            {answerer &&
                                                (' to ' + (answerer.userId === this.props.myUserId
                                                    ? 'you'
                                                    : answerer.firstName + ' '
                                                    + answerer.lastName))}
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
                        {primaryTag && <SelectedTags tag={primaryTag} isSelected={false} />}
                        {secondaryTag && <SelectedTags tag={secondaryTag} isSelected={false} />}
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
