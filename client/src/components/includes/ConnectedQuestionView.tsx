import * as React from 'react';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';
import AddQuestion from '../includes/AddQuestion';
import { Loader } from 'semantic-ui-react';

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
                                tagRelationsByChildId {
                                    nodes {
                                        parentId
                                    }
                                }
                            }
                        }
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
        loading: boolean,
        allSessions?: {
            nodes: [{
                sessionSeryBySessionSeriesId: {
                    courseByCourseId: {
                        tagsByCourseId: {
                            nodes: [AppTagRelations]
                        }
                    }
                }

            }],
        },
    },
};

const withData = graphql<InputProps, Response>(QUERY, {
    options: ({ sessionId }) => ({
        variables: { sessionId: sessionId }
    })
});

class ConnectedQuestionView extends React.Component<ChildProps<InputProps, Response>, {}> {
    render() {
        const { loading } = this.props.data;

        if (loading) {
            return <Loader active={true} content={'Loading'} />;
        }

        if (this.props.data.allSessions !== undefined) {
            var series = this.props.data.allSessions.nodes[0].sessionSeryBySessionSeriesId;
            var tags = series ? series.courseByCourseId.tagsByCourseId.nodes : [];

            return (
                <AddQuestion
                    tags={tags}
                    sessionId={this.props.sessionId}
                    courseId={this.props.courseId}
                />
            );
        }

        return (
            <div className="QuestionView">
                Error
            </div>
        );

    }
}

export default withData(ConnectedQuestionView);
