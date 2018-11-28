import * as React from 'react';
import { Icon } from 'semantic-ui-react';
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

    // Given an index from [1..n], converts it to text that is displayed
    // on the question cards. 1 => "NOW", 2 => "2nd", 3 => "3rd", and so on.
    getDisplayText(index: number): string {
        index++;
        // Disclaimer: none of us wrote this one-line magic :)
        // It is borrowed from https://stackoverflow.com/revisions/39466341/5
        // return index + ['st', 'nd', 'rd'][((index + 90) % 100 - 10) % 10 - 1] || index + 'th';
        return String(index);
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
        // const myQuestionCSS = this.props.includeRemove ? ' MyQuestion' : '';
        // const bookmarkCSS = this.props.includeBookmark ? ' Bookmark' : '';
        const studentCSS = this.props.isTA ? '' : ' Student';

        return (
            <div className="QueueQuestions">
                {this.props.includeBookmark && <div className="Bookmark" />}
                <p className={'Order ' + (question.status === 'assigned' ? 'assigned' : '')}>
                    {question.status === 'assigned' ? '•••' : this.getDisplayText(this.props.index)}
                </p>
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
                    <p className={'Question' + studentCSS}>{question.content}</p>
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
