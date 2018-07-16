import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import Moment from 'react-moment';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import SelectedTags from '../includes/SelectedTags';

const avatar = require('../../media/userAvatar.svg');

const UPDATE_QUESTION = gql`
mutation UpdateQuestion($questionId: Int!, $status: String) {
    updateQuestionByQuestionId(input: {questionPatch: {status: $status}, questionId: $questionId}) {
        clientMutationId
    }
}
`;

class SessionQuestionsComponent extends React.Component {
    props: {
        question: AppQuestion,
        index: number,
        isTA: boolean,
        isMyQuestion: boolean
    };

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

    _onClick = (event: React.MouseEvent<HTMLElement>, updateQuestion: Function, status: string) => {
        updateQuestion({
            variables: {
                questionId: this.props.question.questionId,
                status: status,
            }
        });
    }

    render() {
        var question = this.props.question;
        const myQuestionCSS = this.props.isMyQuestion ? ' MyQuestion' : '';

        return (
            <div className={'QueueQuestions' + myQuestionCSS}>
                {this.props.isTA &&
                    <div className="studentInformation">
                        <img src={question.userByAskerId.photoUrl || avatar} />
                        <span className="Name">
                            {question.userByAskerId.firstName + ' ' + question.userByAskerId.lastName}
                        </span>
                    </div>
                }
                <p className="Question">{question.content}</p>
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
                    <p className="Order">{this.getDisplayText(this.props.index)}</p>
                    <p className="Time">{<Moment date={question.timeEntered} interval={0} format={'hh:mm A'} />}</p>
                </div>
                {this.props.isTA &&
                    <div className="Buttons">
                        <hr />
                        <Mutation mutation={UPDATE_QUESTION}>
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
                <Mutation mutation={UPDATE_QUESTION}>
                    {(updateQuestion) =>
                        this.props.isMyQuestion &&
                        <div className="Buttons">
                            <hr />
                            <p
                                className="Remove"
                                onClick={(e) => this._onClick(e, updateQuestion, 'retracted')}
                            >
                                <Icon name="close" /> Retract
                            </p>
                        </div>
                    }
                </Mutation>
            </div>
        );
    }
}

export default SessionQuestionsComponent;
