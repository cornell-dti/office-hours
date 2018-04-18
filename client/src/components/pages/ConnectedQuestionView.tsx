import * as React from 'react';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';
import AddQuestion from '../includes/AddQuestion';

const QUERY = gql`
    query FindTagsBySessionId($sessionId: Int!) {
        allSessions(condition: {sessionId: $sessionId}) {
            nodes {
                sessionSeryBySessionSeriesId {
                    courseByCourseId {
                        tagsByCourseId {
                            nodes {
                                tagId
                                name
                                level
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
        allSessions?: {
            nodes: [{
                sessionSeryBySessionSeriesId: {
                    courseByCourseId: {
                        tagsByCourseId: {
                            nodes: [{
                                tagId: number,
                                name: string,
                                level: number
                            }]
                        }
                    }
                }

            }],
        },
    },
};

const withData = graphql<Response, InputProps>(QUERY, {
    options: ({ match }) => ({
        variables: { sessionId: match.params.sessionId }
    })
});

class ConnectedQuestionView extends React.Component<ChildProps<InputProps, Response>, {}> {
    render() {
        const imageURL =
            'https://i2.wp.com/puppypassionn.org/wp-content/uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1';

        console.log(this.props.data)

        if (this.props.data.allSessions !== undefined) {
            var tags = this.props.data.allSessions.nodes[0].sessionSeryBySessionSeriesId.courseByCourseId.tagsByCourseId.nodes

            var primaryTagNames = []
            for (var i = 0; i < tags.length; i++) {
                if (tags[i].level == 1) {
                    primaryTagNames.push(tags[i].name);
                }
            }

            return (
                <div className="QuestionView">
                    <AddQuestion
                        studentName="Sangwoo Kim"
                        studentPicture={imageURL}
                        primaryTags={primaryTagNames}
                        secondaryTags={['Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4',
                            'Assignment 5', 'Assignment 6']}
                        topicTags={['Causality', 'Probability', 'Inference', 'Recursion', 'Regression', 'Classification',
                            'Nearest Neighbor', 'Visualization']}
                    />
                </div>
            );
        }

        return (
            <div className="QuestionView">
                :(
            </div>
        );

    }
}

export default withData(ConnectedQuestionView);