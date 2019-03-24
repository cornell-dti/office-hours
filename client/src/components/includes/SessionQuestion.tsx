import * as React from 'react';
import { Icon, Loader } from 'semantic-ui-react';
import Moment from 'react-moment';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import SelectedTags from './SelectedTags';

const UPDATE_QUESTION = gql`
mutation UpdateQuestion($questionId: Int!, $status: String) {
    updateQuestionByQuestionId(input: {questionPatch: {status: $status}, questionId: $questionId}) {
        clientMutationId
    }
}
`;
const UPDATE_LOCATION = gql`
mutation UpdateLocation($questionId: Int!, $location: String) {
    updateQuestionByQuestionId(input: {questionPatch: {location: $location}, questionId: $questionId}) {
        clientMutationId
    }
}
`;

const UNDO_DONT_KNOW = gql`
mutation UndoDontKnow($questionId: Int!, $status: String!) {
    updateQuestionByQuestionId(input: {questionPatch: {status: $status, timeAddressed: null, answererId: null},
        questionId: $questionId}) {
        clientMutationId
    }
}
`;
const LOCATION_CHAR_LIMIT = 40;

class SessionQuestion extends React.Component {
    props: {
        question: AppQuestion,
        index: number,
        isTA: boolean,
        includeRemove: boolean,
        includeBookmark: boolean,
        myUserId: number,
        triggerUndo: Function,
        refetch: Function,
        isPast: boolean,
    };

    state: {
        showLocation: boolean,
        location: string,
        isEditingLocation: boolean,
        showDotMenu: boolean,
        undoQuestionIdDontKnow?: number,
        undoName?: string,
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            showLocation: false,
            location: this.props.question.location || '',
            isEditingLocation: false,
            showDotMenu: false,
            undoQuestionIdDontKnow: undefined,
            undoName: undefined,
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
    }

    toggleLocationTooltip = () => {
        this.setState({
            showLocation: !this.state.showLocation
        });
    }

    _onClick = (event: React.MouseEvent<HTMLElement>, updateQuestion: Function, status: string) => {
        updateQuestion({
            variables: {
                questionId: this.props.question.questionId,
                status: status,
            }
        });
        const question = this.props.question;
        this.props.triggerUndo(question.questionId, status, question.userByAskerId.computedName);
    }

    setDotMenu = (status: boolean) => {
        this.setState({ showDotMenu: status });
    }

    // triggerUndoDontKnow = (questionId: number, name: string) => {
    //     this.setState({
    //         undoQuestionIdDontKnow: questionId,
    //         undoName: name,
    //     });
    // }

    handleUndoDontKnow = (questionId: number, UndoDontKnow: Function) => {
        UndoDontKnow({
            variables: {
                questionId: questionId,
                status: 'unresolved'
            }
        });
    }

    render() {
        var question = this.props.question;
        const studentCSS = this.props.isTA ? '' : ' Student';

        return (
            <div className="QueueQuestions">
                {this.props.includeBookmark && <div className="Bookmark" />}
                <p className={'Order ' + (question.status === 'assigned' ? 'assigned' : '')}>
                    {question.status === 'assigned' ? '•••' : this.getDisplayText(this.props.index)}
                </p>
                {this.props.includeRemove &&
                    <div className="LocationPin">
                        <Icon
                            onClick={this.toggleLocationTooltip}
                            name="map marker alternate"
                        />
                        <Mutation mutation={UPDATE_LOCATION}>
                            {(updateLocation) => (
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
                                        onChange={(e) => this.handleUpdateLocation(e, updateLocation)}
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
                            )}
                        </Mutation>
                        {this.state.showLocation && <div className="modalShade" />}
                    </div>
                }
                <div className="QuestionInfo">
                    {this.props.isTA &&
                        <div className="studentInformation">
                            <img src={question.userByAskerId.computedAvatar} />
                            <span className="Name">
                                {question.userByAskerId.computedName}
                                {question.status === 'assigned' &&
                                    <React.Fragment>
                                        <span className="assigned"> is assigned
                                        {question.userByAnswererId &&
                                                (' to ' + (question.userByAnswererId.userId === this.props.myUserId
                                                    ? 'you'
                                                    : question.userByAnswererId.computedName))}
                                        </span>
                                    </React.Fragment>
                                }
                            </span>
                        </div>
                    }
                    <div className="Location">
                        {this.props.isTA && question.location}
                    </div>
                    {(this.props.isTA || this.props.includeBookmark || this.props.includeRemove) &&
                        <p className={'Question' + studentCSS}>{question.content}</p>}
                </div>
                <div className="BottomBar">
                    {this.props.isTA && <span className="Spacer" />}
                    <div className="Tags">
                        {question.questionTagsByQuestionId.nodes.map(
                            (tag) => <SelectedTags
                                key={tag.tagByTagId.tagId}
                                isSelected={false}
                                tag={tag.tagByTagId.name}
                                level={tag.tagByTagId.level}
                                onClick={null}
                            />
                        )}
                    </div>
                    <p className="Time">
                        posted at&nbsp;
                        {<Moment date={question.timeEntered} interval={0} format={'hh:mm A'} />}
                    </p>
                </div>
                {this.props.isTA &&
                    <div className="Buttons">
                        <hr />
                        <Mutation mutation={UPDATE_QUESTION} onCompleted={() => this.props.refetch()}>
                            {(updateQuestion) =>
                                <div className="TAButtons">
                                    {question.status === 'unresolved' &&
                                        <p
                                            className="Begin"
                                            onClick={(e) => this._onClick(e, updateQuestion, 'assigned')}
                                        >
                                            Assign to Me
                                        </p>
                                    }
                                    {question.status === 'assigned' &&
                                        <React.Fragment>
                                            <p
                                                className="Delete"
                                                onClick={(e) => this._onClick(e, updateQuestion, 'no-show')}
                                            >
                                                No show
                                            </p>
                                            <p
                                                className="Done"
                                                onClick={(e) => this._onClick(e, updateQuestion, 'resolved')}
                                            >
                                                Done
                                            </p>
                                            <p
                                                className="DotMenu"
                                                onClick={() => this.setDotMenu(!this.state.showDotMenu)}
                                            >
                                                ...
                                            </p>
                                            {this.state.showDotMenu &&
                                                <Mutation
                                                    mutation={UNDO_DONT_KNOW}
                                                    onCompleted={() => this.props.refetch()}
                                                >
                                                    {(UndoDontKnow) =>
                                                        <React.Fragment>
                                                            <ul
                                                                className="IReallyDontKnow"
                                                                tabIndex={1}
                                                                onClick={() => this.setDotMenu(false)}
                                                            >
                                                                <li
                                                                    onClick={() => this.handleUndoDontKnow(
                                                                        question.questionId,
                                                                        UndoDontKnow
                                                                    )}
                                                                >
                                                                    I Really Don't Know
                                                                </li>
                                                            </ul>
                                                        </React.Fragment>
                                                    }
                                                </Mutation>
                                            }
                                        </React.Fragment>
                                    }
                                </div>
                            }
                        </Mutation>
                    </div>
                }
                <Mutation mutation={UPDATE_QUESTION} onCompleted={() => this.props.refetch()}>
                    {(updateQuestion) =>
                        this.props.includeRemove && !this.props.includeBookmark && !this.props.isPast &&
                        <div className="Buttons">
                            <hr />
                            <p
                                className="Remove"
                                onClick={(e) => this._onClick(e, updateQuestion, 'retracted')}
                            >
                                <Icon name="close" /> Remove
                            </p>
                        </div>
                    }
                </Mutation>
            </div>
        );
    }
}

export default SessionQuestion;
