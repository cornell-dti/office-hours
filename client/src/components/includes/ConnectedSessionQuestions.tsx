import * as React from 'react';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

const QUERY = gql`
    query FindQuestionsBySessionId($sessionId: Int!) {
        sessionBySessionId(sessionId: $sessionId) {
            questionsBySessionId {
                nodes {
                    questionId
                    content
                    status
                    userByAskerId {
                        firstName
                        lastName
                    }
                    timeEntered
                    questionTagsByQuestionId {
                        nodes {
                            tagId
                            tagByTagId {
                                name
                            }
                        }
                    }
                }
            }
        }
    }
`;

type InputProps = {
    match: {
        params: {
            sessionId: number,
        },
    },
    data: {
        sessionBySessionId?: {
            questionsBySessionId: {
                nodes: [{}],
            },
        },
    },
};

const withData = graphql<Response, InputProps>(QUERY, {
    options: ({ match }) => ({
        variables: { sessionId: match.params.sessionId }
    })
});

class ConnectedSessionQuestions extends React.Component<ChildProps<InputProps, Response>, {}> {
    render() {
        var questions: Question[] = [];
        if (this.props.data.sessionBySessionId !== undefined) {
            if (this.props.data.sessionBySessionId !== null) {
                this.props.data.sessionBySessionId.questionsBySessionId.nodes.forEach((node: QuestionNode) => {
                    if (node.status !== 'resolved') {
                        var questionTags: Tag[] = [];
                        if (node.questionTagsByQuestionId !== undefined) {
                            if (node.questionTagsByQuestionId !== null) {
                                node.questionTagsByQuestionId.nodes.forEach((tagNode: TagNode) => {
                                    questionTags.push({
                                        id: tagNode.tagId,
                                        name: tagNode.tagByTagId.name
                                    });
                                });
                            }
                        }
                        questions.push({
                            id: node.questionId,
                            name: node.userByAskerId.firstName + ' ' + node.userByAskerId.lastName,
                            content: node.content,
                            time: new Date(node.timeEntered),
                            tags: questionTags
                        });
                    }
                });
            }
        }
        questions.sort(function (a: Question, b: Question) {
            return (a.time > b.time) ? -1 : 1;
        });

        return <SessionQuestionsContainer questions={questions} isDetailed={false} useFakeData={false} />;
    }
}

export default withData(ConnectedSessionQuestions);
