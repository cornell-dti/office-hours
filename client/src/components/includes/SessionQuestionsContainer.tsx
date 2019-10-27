import * as React from 'react';
import SessionQuestion from './SessionQuestion';
import { Icon } from 'semantic-ui-react';
import * as moment from 'moment';

import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const LEAVE_QUEUE = gql`
mutation LeaveQueue($questionId: Int!, $status: String!) {
    updateQuestionByQuestionId(input: {questionPatch: {status: $status, timeAddressed: null, answererId: null},
        questionId: $questionId}) {
        clientMutationId
    }
}
`;
class SessionQuestionsContainer extends React.Component {
    props: {
        isTA: boolean,
        questions: AppQuestion[] | null,
        myUserId: number,
        handleJoinClick: Function,
        triggerUndo: Function,
        refetch: Function,
        isOpen: boolean,
        isPast: boolean,
        openingTime: Date,
        haveAnotherQuestion: boolean,
        otherQuestionsId: number[],
    };

    state: {
        sentNotification: boolean
    };

    componentDidMount() {
        try {
            // Request permission to send desktop notifications
            // @ts-ignore Permission is added in TS 3.0, remove then
            // https://github.com/Microsoft/TypeScript/issues/14701
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        } catch (error) {
            // Do nothing. iOS crashes because Notification isn't defined
        }
    }

    dismissLeaveQueue = () => {
        this.props.refetch();
    }

    handleLeaveQueue = (leaveQueue: Function, refetch: Function) => {
        leaveQueue({
            variables: {
                questionId: this.props.otherQuestionsId[0],
                status: 'retracted'
            }
        });
    }

    constructor(props: {}) {
        super(props);
        this.state = {
            sentNotification: false,
        };
    }

    render() {
        var questions = this.props.questions;
        // If the user has questions, store them in myQuestion[]
        var myQuestion = questions && questions.filter(q => q.userByAskerId.userId === this.props.myUserId);
        // Make sure that the data has loaded and user has a question
        if (questions && myQuestion && myQuestion.length > 0) {
            // Get user's position in queue (0 indexed)
            let myQuestionIndex = questions.indexOf(myQuestion[0]);
            // Update tab with user position
            document.title = '(' + (1 + myQuestionIndex) + ') Queue Me In';
            // if user is up and we haven't already sent a notification, send one.
            if (myQuestionIndex === 0 && !this.state.sentNotification) {
                this.setState({ sentNotification: true });
                try {
                    var n = new Notification('Your question is up!');
                    setTimeout(n.close.bind(n), 4000);
                } catch (error) {
                    // Do nothing. iOS crashes because Notification isn't defined
                }
                // If next render, the user isn't at 0 anymore, reset state
            } else if (myQuestionIndex !== 0 && this.state.sentNotification) {
                this.setState({ sentNotification: false });
            }
        } else if (this.props.isTA && questions) {
            document.title = '(' + questions.length + ') Queue Me In';
        } else {
            // Reset title and notif state
            document.title = 'Queue Me In';
            if (this.state.sentNotification) {
                this.setState({ sentNotification: false });
            }
        }

        return (
            <React.Fragment>
                {!this.props.isTA && myQuestion && myQuestion.length === 0 && this.props.isOpen
                    && this.props.haveAnotherQuestion &&
                    <React.Fragment>
                        <div className="SessionLeaveQueueMessage">
                            <Mutation mutation={LEAVE_QUEUE} onCompleted={this.dismissLeaveQueue}>
                                {(leaveQueue) =>
                                    <span
                                        className="leaveQueue"
                                        onClick={() =>
                                            this.handleLeaveQueue(leaveQueue, this.props.refetch)
                                        }
                                    >
                                        You have already joined a queue! <span className="removeQuestionLeaveQueue">
                                            Remove your question to join another queue.
                                        </span>
                                    </span>
                                }
                            </Mutation>
                        </div>
                    </React.Fragment>
                }
                <div className="SessionQuestionsContainer splitQuestions" >
                    {!this.props.isTA && myQuestion && myQuestion.length === 0 && this.props.isOpen
                        && !this.props.haveAnotherQuestion &&
                        <div className="SessionJoinButton" onClick={() => this.props.handleJoinClick()}>
                            <p><Icon name="plus" /> Join the Queue</p>
                        </div>
                    }
                    {questions && questions.length > 0 && this.props.isPast &&
                        <div className="SessionClosedMessage">
                            This queue has closed and is no longer accepting new questions.
                    </div>
                    }
                    {questions && myQuestion && myQuestion.length > 0 &&
                        <div className="User">
                            <p className="QuestionHeader">My Question</p>
                            <SessionQuestion
                                key={myQuestion[0].questionId}
                                question={myQuestion[0]}
                                index={questions.indexOf(myQuestion[0])}
                                isTA={this.props.isTA}
                                includeRemove={true}
                                includeBookmark={false}
                                triggerUndo={this.props.triggerUndo}
                                refetch={this.props.refetch}
                                isPast={this.props.isPast}
                                myUserId={this.props.myUserId}
                            />
                            <p className="Queue">Queue</p>
                        </div>
                    }
                    {questions && questions.length > 0 &&
                        questions.map((question, i: number) => (
                            <SessionQuestion
                                key={question.questionId}
                                question={question}
                                index={i}
                                isTA={this.props.isTA}
                                includeRemove={false}
                                includeBookmark={question.userByAskerId.userId === this.props.myUserId}
                                triggerUndo={this.props.triggerUndo}
                                refetch={this.props.refetch}
                                isPast={this.props.isPast}
                                myUserId={this.props.myUserId}
                            />
                        ))
                    }
                    {questions && questions.length === 0 &&
                        <React.Fragment>
                            <p className="noQuestionsHeading">
                                {this.props.isOpen ? 'Queue Currently Empty' :
                                    this.props.isPast ? 'Queue Has Closed' : 'Queue Not Open Yet'}
                            </p>
                            {!this.props.isOpen ?
                                (
                                    this.props.isPast ?
                                        <p className="noQuestionsWarning">This office hour session has ended.</p> :
                                        <p className="noQuestionsWarning">
                                            Please check back at {moment(this.props.openingTime).format('h:mm A')}
                                            {
                                                moment().startOf('day') ===
                                                    moment(this.props.openingTime).startOf('day')
                                                    ? '' : (' on ' + moment(this.props.openingTime).format('MMM D'))
                                            }!
                                    </p>
                                ) :
                                !this.props.isTA
                                    ? <p className="noQuestionsWarning">Be the first to join the queue!</p>
                                    : <p className="noQuestionsWarning">No questions in the queue yet. </p>
                            }
                        </React.Fragment>
                    }
                </div>
            </React.Fragment>
        );
    }
}

export default SessionQuestionsContainer;
