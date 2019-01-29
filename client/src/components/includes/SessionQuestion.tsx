import * as React from 'react';
import { Icon, Loader } from 'semantic-ui-react';
import Moment from 'react-moment';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import SelectedTags from '../includes/SelectedTags';

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
const LOCATION_CHAR_LIMIT = 40;

class SessionQuestion extends React.Component {
    props: {
        question: AppQuestion,
        index: number,
        isTA: boolean,
        isMyQuestion: boolean,
        triggerUndo: Function,
        refetch: Function,
        isPast: boolean,
    };

    state: {
        showLocation: boolean,
        location: string,
        isEditingLocation: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            showLocation: false,
            location: this.props.question.location || '',
            isEditingLocation: false
        };
    }

    // Given an index from [1..n], converts it to text that is displayed
    // on the question cards. 1 => "NOW", 2 => "2nd", 3 => "3rd", and so on.
    getDisplayText(index: number): string {
        index++;
        // Disclaimer: none of us wrote this one-line magic :)
        // It is borrowed from https://stackoverflow.com/revisions/39466341/5
        return index + ['st', 'nd', 'rd'][((index + 90) % 100 - 10) % 10 - 1] || index + 'th';
    }

    public handleUpdateLocation = (event: React.ChangeEvent<HTMLTextAreaElement>,
                                   updateLocation: Function): void => {
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

    render() {
        var question = this.props.question;
        const myQuestionCSS = this.props.isMyQuestion ? ' MyQuestion' : '';

        return (
            <div className={'QueueQuestions' + myQuestionCSS}>
                {this.props.isTA &&
                    <div className="studentInformation">
                        <img src={question.userByAskerId.computedAvatar} />
                        <span className="Name">
                            {question.userByAskerId.computedName}
                        </span>
                    </div>
                }
                <div className="Location">
                    {this.props.isTA && question.location}
                </div>
                <div className="Question">
                    {question.content}
                    {this.props.isMyQuestion ?
                        <div>
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
                                    </div>
                                )}
                            </Mutation>
                        </div>
                        : ''
                    }
                </div>
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
                <div className="BottomBar">
                    {/* <p className={'Order' + (this.props.index === 0 ? ' now' : '')}>
                        {this.getDisplayText(this.props.index)}
                    </p> */}
                    <p className="Order">
                        {this.getDisplayText(this.props.index)}
                    </p>
                    <p className="Time">{<Moment date={question.timeEntered} interval={0} format={'hh:mm A'} />}</p>
                </div>
                {this.props.isTA &&
                    <div className="Buttons">
                        <hr />
                        <Mutation mutation={UPDATE_QUESTION} onCompleted={() => this.props.refetch()}>
                            {(updateQuestion) =>
                                <div className="TAButtons">
                                    <p
                                        className="Delete"
                                        onClick={(e) => this._onClick(e, updateQuestion, 'no-show')}
                                    >
                                        <Icon name="hourglass end" /> No-show
                                    </p>
                                    <p
                                        className="Resolve"
                                        onClick={(e) => this._onClick(e, updateQuestion, 'resolved')}
                                    >
                                        <Icon name="check" /> Resolve
                                    </p>
                                </div>
                            }
                        </Mutation>
                    </div>
                }
                <Mutation mutation={UPDATE_QUESTION} onCompleted={() => this.props.refetch()}>
                    {(updateQuestion) =>
                        this.props.isMyQuestion && !this.props.isPast &&
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
