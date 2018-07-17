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
                                activated
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
                            nodes: [{
                                tagId: number,
                                name: string,
                                level: number,
                                activated: boolean,
                                tagRelationsByChildId: {
                                    nodes: [{
                                        parentId: number
                                    }]
                                }
                            }]
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

            var primaryTagNames = [];
            var secondaryTagNames = [];
            var primaryTagIds = [];
            var secondaryTagIds = [];
            var secondaryTagParentIds = [];
            for (var i = 0; i < tags.length; i++) {
                if (tags[i].level === 1 && tags[i].activated) {
                    primaryTagNames.push(tags[i].name);
                    primaryTagIds.push(tags[i].tagId);
                }
            }
            for (i = 0; i < tags.length; i++) {
                if (tags[i].level === 2) {
                    var parentId = tags[i].tagRelationsByChildId.nodes[0].parentId;
                    if (primaryTagIds.indexOf(parentId) !== -1) {
                        secondaryTagNames.push(tags[i].name);
                        secondaryTagIds.push(tags[i].tagId);
                        secondaryTagParentIds.push(parentId);
                    }
                }
            }

            return (
                <div className="QuestionView">
                    <AddQuestion
                        primaryTags={primaryTagNames}
                        secondaryTags={secondaryTagNames}
                        primaryTagsIds={primaryTagIds}
                        secondaryTagsIds={secondaryTagIds}
                        secondaryTagParentIds={secondaryTagParentIds}
                        sessionId={this.props.sessionId}
                        courseId={this.props.courseId}
                    />
                </div>
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
