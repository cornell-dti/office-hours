import * as React from 'react';

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
    sessionId: string,
    courseId: string,
    mobileBreakpoint: number,
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
                    charLimit={session.courseByCourseId.charLimit}
                    endTime={session.endTime}
                    mobileBreakpoint={this.props.mobileBreakpoint}
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
