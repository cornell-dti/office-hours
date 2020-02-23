/* eslint-disable @typescript-eslint/member-delimiter-style */
import * as React from 'react';
import { Icon, Loader } from 'semantic-ui-react';
import Moment from 'react-moment';
import { firestore } from '../../firebase';
import { docData } from 'rxfire/firestore';
import SelectedTags from './SelectedTags';
import { Observable } from 'rxjs';

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

class SessionQuestion extends React.Component {
    props!: {
        question: FireQuestion,
        index: number,
        isTA: boolean,
        includeRemove: boolean,
        myUserId: string,
        triggerUndo: Function,
        isPast: boolean,
    };

    state!: {
        showLocation: boolean,
        location: string,
        isEditingLocation: boolean,
        showDotMenu: boolean,
        undoQuestionIdDontKnow?: number,
        undoName?: string,
        asker?: FireUser,
        answerer?: FireUser,
        primaryTag?: FireTag,
        secondaryTag?: FireTag
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            showLocation: false,
            location: this.props.question.location || '',
            isEditingLocation: false,
            showDotMenu: false,
        };

        const asker$: Observable<FireUser> =
            docData(firestore.doc('users/' + this.props.question.askerId), 'userId');
        asker$.subscribe(asker => this.setState({ asker }));

        if (this.props.question.answererId) {
            // RYAN_TODO make this work when we get an answerer id
            const answerer$: Observable<FireUser> =
                docData(firestore.doc('users/' + this.props.question.answererId), 'userId');
            answerer$.subscribe(answerer => this.setState({ answerer }));
        }

        const primaryTag$: Observable<FireTag>
            = docData(firestore.doc('tags/' + this.props.question.primaryTag), 'tagId');
        primaryTag$.subscribe(primaryTag => this.setState({ primaryTag }));

        const secondaryTag$: Observable<FireTag>
            = docData(firestore.doc('tags/' + this.props.question.secondaryTag), 'tagId');
        secondaryTag$.subscribe(secondaryTag => this.setState({ secondaryTag }));
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

    public handleUpdateLocation = (event: React.ChangeEvent<HTMLTextAreaElement>, updateLocation: Function): void => {
        this.state.isEditingLocation = true;
        const target = event.target as HTMLTextAreaElement;
        if (target.value.length <= LOCATION_CHAR_LIMIT) {
            this.setState({
                location: target.value
            });
            updateLocation({
                variables: {
                    questionId: this.props.question.questionId,
                    location: target.value,
                }
            });
            setTimeout(() => { this.state.isEditingLocation = false; }, 100);
        }
    };

    toggleLocationTooltip = () => {
        this.setState({
            showLocation: !this.state.showLocation
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
        const includeBookmark = this.props.question.askerId.id === this.props.myUserId;

        return (
            <div className="QueueQuestions">
                {includeBookmark && <div className="Bookmark" />}
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
                            // onChange={(e) => this.handleUpdateLocation(e, updateLocation)}
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
                {this.state.showLocation && <div className="modalShade" />}
                <div className="QuestionInfo">
                    {this.props.isTA && this.state.asker &&
                        <div className="studentInformation">
                            <img
                                src={this.state.asker === undefined
                                    ? '/placeholder.png'
                                    : this.state.asker.photoUrl}
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
                                // onClick={(e) => this._onClick(e, updateQuestion, 'assigned')}
                                >
                                    Assign to Me
                                </p>
                            }
                            {question.status === 'assigned' &&
                                <React.Fragment>
                                    <p
                                        className="Delete"
                                    // onClick={(e) => this._onClick(e, updateQuestion, 'no-show')}
                                    >
                                        No show
                                    </p>
                                    <p
                                        className="Done"
                                    // onClick={(e) => this._onClick(e, updateQuestion, 'resolved')}
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
                {this.props.includeRemove && !includeBookmark && !this.props.isPast &&
                    <div className="Buttons">
                        <hr />
                        <p
                            className="Remove"
                            // RYAN_TODO: support remove question
                            // onClick={(e) => this._onClick(e, updateQuestion, 'retracted')}
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
