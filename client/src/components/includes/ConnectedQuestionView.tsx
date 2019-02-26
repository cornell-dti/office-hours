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
                courseByCourseId {
                    charLimit
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
                endTime
            }
        }
    }
`;

type InputProps = {
    sessionId: number,
    courseId: number,
    mobileWidth: number,
    callback: Function,
    data: {
        loading: boolean,
        allSessions?: {
            nodes: [{
                courseByCourseId: {
                    charLimit: number
                    tagsByCourseId: {
                        nodes: [AppTagRelations]
                    }
                }
                endTime: Date
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
            var session = this.props.data.allSessions.nodes[0];
            var tags = session ? session.courseByCourseId.tagsByCourseId.nodes : [];

            return (
                <AddQuestion
                    tags={tags}
                    sessionId={this.props.sessionId}
                    courseId={this.props.courseId}
                    callback={this.props.callback}
                    charLimit={session.courseByCourseId.charLimit}
                    endTime={session.endTime}
                    mobileWidth={this.props.mobileWidth}
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
