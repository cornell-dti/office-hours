import * as React from 'react';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

const QUERY = gql`
query FindQuestionsBySessionId($sessionId: Int!, $courseId: Int!) {
    sessionBySessionId(sessionId: $sessionId) {
        questionsBySessionId(orderBy: TIME_ENTERED_ASC) {
            nodes {
                questionId
                content
                status
                userByAskerId {
                    firstName
                    lastName
                    userId
                    photoUrl
                }
                timeEntered
                questionTagsByQuestionId {
                    nodes {
                        tagId
                        tagByTagId {
                            name
                            level
                        }
                    }
                }
            }
        }
    }
    apiGetCurrentUser {
        nodes {
            courseUsersByUserId(condition:{courseId:$courseId}) {
                nodes {
                    role
                    userId
                }
            }
        }
    }
}
`;

type InputProps = {
    sessionId: number,
    courseId: number,
    data: {
        sessionBySessionId?: {
            questionsBySessionId: {
                nodes: [{}],
            }
        },
        apiGetCurrentUser?: {
            nodes: [{
                courseUsersByUserId: {
                    nodes: [{
                        role: string,
                        userId: number
                    }]
                }
            }]
        }
    }
};

const withData = graphql<InputProps, Response>(QUERY, {
    options: ({ sessionId, courseId }) => ({
        variables: { sessionId: sessionId, courseId: courseId }
    })
});

class ConnectedSessionQuestions extends React.Component<ChildProps<InputProps, Response>, {}> {
    render() {
        var questions: Question[] = [];
        var isTa = false;
        var myUserId = -1;

        if (this.props.data &&
            this.props.data.apiGetCurrentUser) {
            if (this.props.data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role === 'ta'
                || this.props.data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role === 'professor') {
                isTa = true;
            }
            myUserId = this.props.data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].userId;
        }

        if (this.props.data &&
            this.props.data.sessionBySessionId) {
            this.props.data.sessionBySessionId.questionsBySessionId.nodes.forEach((node: QuestionNode) => {
                if (node.status === 'unresolved') {
                    var questionTags: Tag[] = [];
                    if (node.questionTagsByQuestionId !== undefined) {
                        if (node.questionTagsByQuestionId !== null) {
                            node.questionTagsByQuestionId.nodes.forEach((tagNode: TagNode) => {
                                questionTags.push({
                                    id: tagNode.tagId,
                                    name: tagNode.tagByTagId.name,
                                    level: tagNode.tagByTagId.level
                                });
                            });
                        }
                    }
                    questions.push({
                        id: node.questionId,
                        name: node.userByAskerId.firstName + ' ' + node.userByAskerId.lastName,
                        content: node.content,
                        time: new Date(node.timeEntered),
                        tags: questionTags,
                        userId: node.userByAskerId.userId,
                        timeEntered: node.timeEntered,
                        photoUrl: node.userByAskerId.photoUrl
                    });
                }
            });
        }

        return (
            <SessionQuestionsContainer
                isTA={isTa}
                sessionId={this.props.sessionId}
                questions={questions}
                myUserId={myUserId}
            />
        );
    }
}

export default withData(ConnectedSessionQuestions);
