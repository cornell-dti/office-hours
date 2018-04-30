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
                            nodes: [{
                                tagId: number,
                                name: string,
                                level: number
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

const withData = graphql<Response, InputProps>(QUERY, {
    options: ({ sessionId }) => ({
        variables: { sessionId: sessionId }
    })
});

class ConnectedQuestionView extends React.Component<ChildProps<InputProps, Response>, {}> {
    render() {
        const imageURL =
            'https://i2.wp.com/puppypassionn.org/wp-content/uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1';
        const { loading } = this.props.data;

        if (loading) {
            return <Loader active={true} content={'Loading'} />;
        }

        if (this.props.data.allSessions !== undefined) {
            var series = this.props.data.allSessions.nodes[0].sessionSeryBySessionSeriesId;
            var tags = series ? series.courseByCourseId.tagsByCourseId.nodes : [];

            var primaryTagNames = [];
            var secondaryTagNames = [];
            var primaryTagNamesIds = [];
            var secondaryTagNamesIds = [];
            var secondaryTagParentIds = [];
            for (var i = 0; i < tags.length; i++) {
                if (tags[i].level === 1) {
                    primaryTagNames.push(tags[i].name);
                    primaryTagNamesIds.push(tags[i].tagId);
                }
                if (tags[i].level === 2) {
                    secondaryTagNames.push(tags[i].name);
                    secondaryTagNamesIds.push(tags[i].tagId);
                    secondaryTagParentIds.push(tags[i].tagRelationsByChildId.nodes[0].parentId);
                }
            }

            return (
                <div className="QuestionView">
                    <AddQuestion
                        taName="Sangwoo Kim"
                        taPicture={imageURL}
                        primaryTags={primaryTagNames}
                        secondaryTags={secondaryTagNames}
                        primaryTagsIds={primaryTagNamesIds}
                        secondaryTagsIds={secondaryTagNamesIds}
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
