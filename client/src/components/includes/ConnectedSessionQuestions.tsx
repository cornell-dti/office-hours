import * as React from 'react';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

const QUERY = gql`
query FindQuestionsBySessionId($userId: Int!, $sessionId: Int!) {
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
        courseByCourseId {
            courseUsersByCourseId(condition: {userId: $userId}), {
                nodes {
                    role
                }
            }
        }
    }
}
`;

type InputProps = {
    sessionId: number,
    data: {
        sessionBySessionId?: {
            questionsBySessionId: {
                nodes: [{}],
            },
            courseByCourseId: {
                courseUsersByCourseId: {
                    nodes: [{
                        role: string
                    }]
                }
            },
        },
    },
    isTA: boolean,
    userId: number,
};

const withData = graphql<InputProps, Response>(QUERY, {
    options: ({ sessionId, userId }) => ({
        variables: { sessionId: sessionId, userId: userId }
    })
});

class ConnectedSessionQuestions extends React.Component<ChildProps<InputProps, Response>, {}> {
    render() {
        var questions: Question[] = [];
        var isTa = false;
        if (this.props.data.sessionBySessionId) {

            if (this.props.data.sessionBySessionId.courseByCourseId) {
                var course = this.props.data.sessionBySessionId.courseByCourseId;
                if (course) {
                    isTa = course.courseUsersByCourseId.nodes[0].role === 'ta';
                }
            }

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
                        timeEntered: node.timeEntered
                    });
                }
            });
        }

        return (
            <SessionQuestionsContainer
                isTA={isTa}
                sessionId={this.props.sessionId}
                questions={questions}
            />
        );
    }
}

export default withData(ConnectedSessionQuestions);
