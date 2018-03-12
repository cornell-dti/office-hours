import * as React from 'react';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

const QUERY = gql`
    query FindQuestionsBySessionId($sessionId: Int!) {
        sessionBySessionId(sessionId: $sessionId)  {
            questionsBySessionId  {
                nodes  {
                    questionId
                    value
                    student
                    questionTagsByQuestionId  {
                        nodes  {
                            tagId
                            tagByTagId  {
                                value
                                courseId
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
            sessionId: number
        }
    },
    data: {
        sessionBySessionId?: {
            questionsBySessionId: {
                nodes: [{}]
            }
        }
    }
};

const withData = graphql<Response, InputProps>(QUERY, {
    options: ({ match }) => ({
        variables: { 'sessionId': match.params.sessionId }
    })
});

class ConnectedSessionQuestions extends React.Component<ChildProps<InputProps, Response>, {}> {
    render() {
        var questions: Question[] = [];
        if (this.props.data.sessionBySessionId !== undefined) {
            if (this.props.data.sessionBySessionId !== null) {
                this.props.data.sessionBySessionId.questionsBySessionId.nodes.forEach((node: QuestionNode) => {
                    var questionTags: Tag[] = [];
                    if (node.questionTagsByQuestionId !== undefined) {
                        if (node.questionTagsByQuestionId !== null) {
                            node.questionTagsByQuestionId.nodes.forEach((tagNode: TagNode) => {
                                questionTags.push({
                                    id: tagNode.tagId,
                                    value: tagNode.tagByTagId.value
                                });
                            });
                        }
                    }
                    questions.push({
                        id: node.questionId,
                        name: node.student,
                        value: node.value,
                        time: 0,
                        tags: questionTags
                    });
                });
            }
        }

        return (<SessionQuestionsContainer questions={questions} isDetailed={false} />);
    }
}

export default withData(ConnectedSessionQuestions);
