import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import Moment from 'react-moment';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const UPDATE_QUESTION = gql`
mutation UpdateQuestion($questionId: Int!, $status: String, $timeResolved: Datetime, $sessionId: Int, $answererId: Int) {
    updateQuestionByQuestionId(input: {questionPatch: {status: $status, timeResolved: $timeResolved, sessionId: $sessionId, answererId: $answererId}, questionId: $questionId}) {
        clientMutationId
    }
}
`;

class SessionQuestionsComponent extends React.Component {

    props: {
        questionId: number,
        sessionId: number,
        studentPicture: string,
        studentName: string,
        studentQuestion: string,
        tags: Tag[],
        index: number,
        isTA: boolean,
        time: string,
        isMyQuestion: boolean
    };

    state: {
      answererId: number
    }

    constructor(props: {}) {
        super(props);
        this.state = {
            answererId: 1
        };
        this.handleClick = this.handleClick.bind(this);
        this._onClickDelete = this._onClickDelete.bind(this);
        this._onClickResolve = this._onClickResolve.bind(this);
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
            return index + ['st', 'nd', 'rd'][((index + 90) % 100 - 10) % 10 - 1] || index  + 'th';
        }
    }

    public handleClick(event: React.MouseEvent<HTMLElement>): void {
        this.setState({ redirect: true });
    }

    _onClickDelete(event: React.MouseEvent<HTMLElement>, f: Function) {
      f({
          variables: {
              questionId: this.props.questionId,
              status: "deleted",
              timeEntered: new Date(),
              sessionId: this.props.sessionId,
              answererId: this.state.answererId
          }
      });
      //this.props.handleShowClick(this.props.questionId, "deleted")
    }

    _onClickResolve(event: React.MouseEvent<HTMLElement>, f: Function) {
      f({
          variables: {
              questionId: this.props.questionId,
              status: "resolved",
              timeEntered: new Date(),
              sessionId: this.props.sessionId,
              answererId: this.state.answererId
          }
      });
      //this.props.handleShowClick(this.props.questionId, "resolved")
    }

    render() {
        var tagsList = this.props.tags.map(
            (tag) => {
                return <p key={tag.id}>{tag.name}</p>;
            }
        );

        return (
            <div className="QueueQuestions">
                {
                    this.props.isTA &&
                    <div className="studentInformation">
                        <img src={this.props.studentPicture} />
                        <p className="Name">{this.props.studentName}</p>
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
                            {(UpdateQuestions) =>
                                <div className="TAButtons">
                                    <p className="Delete" onClick={(e) => this._onClickDelete(e, UpdateQuestions)}><Icon name="close" /> Delete</p>
                                    <p className="Resolve" onClick={(e) => this._onClickResolve(e, UpdateQuestions)}><Icon name="check" /> Resolve</p>
                                </div>
                            }
                        </Mutation>
                    </div>
                }
                {
                    this.props.isMyQuestion &&
                    <div className="Buttons">
                        <hr />
                        <p className="Remove"><Icon name="close" /> Remove</p>
                    </div>
                }
            </div>
        );
    }
}

export default SessionQuestionsComponent;
