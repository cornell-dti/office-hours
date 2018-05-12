import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import Moment from 'react-moment';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import SelectedTags from '../includes/SelectedTags';

const UPDATE_QUESTION = gql`
mutation UpdateQuestion($questionId: Int!, $status: String, $timeResolved: Datetime, $answererId: Int) {
    updateQuestionByQuestionId(input: {questionPatch: {status: $status, timeResolved: $timeResolved,
        answererId: $answererId}, questionId: $questionId}) {
        clientMutationId
    }
}
`;

const userId = 1;   // TODO fetch from cookie

class SessionQuestionsComponent extends React.Component {

    props: {
        questionId: number,
        studentPicture: string,
        studentName: string,
        studentQuestion: string,
        tags: Tag[],
        index: number,
        isTA: boolean,
        time: string,
        isMyQuestion: boolean
    };

    constructor(props: {}) {
        super(props);
        this._onClickDelete = this._onClickDelete.bind(this);
        this._onClickResolve = this._onClickResolve.bind(this);
        this._onClickRetract = this._onClickRetract.bind(this);
    }

    // Given an index from [1..n], converts it to text that is displayed
    // on the question cards. 1 => "NOW", 2 => "2nd", 3 => "3rd", and so on.
    getDisplayText(index: number): string {
        index++;
        if (index === 1) {
            return 'NOW';
        } else {
            // Disclaimer: none of us wrote this one-line magic :)
            // It is borrowed from https://stackoverflow.com/revisions/39466341/5
            return index + ['st', 'nd', 'rd'][((index + 90) % 100 - 10) % 10 - 1] || index + 'th';
        }
    }

    _onClickDelete(event: React.MouseEvent<HTMLElement>, updateQuestion: Function) {
        updateQuestion({
            variables: {
                questionId: this.props.questionId,
                status: 'noshow',
                timeResolved: new Date(),
                answererId: userId
            }
        });
    }

    _onClickResolve(event: React.MouseEvent<HTMLElement>, updateQuestion: Function) {
        updateQuestion({
            variables: {
                questionId: this.props.questionId,
                status: 'resolved',
                timeResolved: new Date(),
                answererId: userId
            }
        });
    }

    // User retracts (i.e. removes) their own question from the queue
    _onClickRetract(event: React.MouseEvent<HTMLElement>, updateQuestion: Function) {
        updateQuestion({
            variables: {
                questionId: this.props.questionId,
                status: 'retracted',
                timeResolved: new Date(),
                answererId: userId
            }
        });
    }

    render() {
        var tagsList = this.props.tags.map(
            (tag) => {
                return (
                    <SelectedTags
                        key={tag.id}
                        ifSelected={false}
                        tag={tag.name}
                        level={tag.level}
                        index={0}
                        onClick={null}
                    />
                );
                // return <p key={tag.id}>{tag.name}</p>;
            }
        );

        const myQuestionCSS = this.props.isMyQuestion ? ' MyQuestion' : '';

        return (
            <div className={'QueueQuestions' + myQuestionCSS}>
                {
                    this.props.isTA &&
                    <div className="studentInformation">
                        <img src={this.props.studentPicture} />
                        <span className="Name">{this.props.studentName}</span>
                    </div>
                }
                <p className="Question">{this.props.studentQuestion}</p>
                <div className="Tags">
                    {tagsList}
                </div>
                <div className="BottomBar">
                    <p className="Order">{this.getDisplayText(this.props.index)}</p>
                    <p className="Time">{<Moment date={this.props.time} interval={0} format={'hh:mm A'} />}</p>
                </div>
                {
                    this.props.isTA &&
                    <div className="Buttons">
                        <hr />
                        <Mutation mutation={UPDATE_QUESTION}>
                            {(updateQuestion) =>
                                <div className="TAButtons">
                                    <p
                                        className="Delete"
                                        onClick={(e) => this._onClickDelete(e, updateQuestion)}
                                    >
                                        No-Show
                                    </p>
                                    <p
                                        className="Resolve"
                                        onClick={(e) => this._onClickResolve(e, updateQuestion)}
                                    >
                                        <Icon name="check" /> Resolve
                                    </p>
                                </div>
                            }
                        </Mutation>
                    </div>
                }
                <Mutation mutation={UPDATE_QUESTION}>
                    {(updateQuestion) =>
                        this.props.isMyQuestion &&
                        <div className="Buttons">
                            <hr />
                            <p
                                className="Remove"
                                onClick={(e) => this._onClickRetract(e, updateQuestion)}
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

export default SessionQuestionsComponent;
