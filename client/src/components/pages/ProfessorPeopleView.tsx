import * as React from 'react';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Redirect } from 'react-router';

const METADATA_QUERY = gql`
query GetMetadata($courseId: Int!) {
    apiGetCurrentUser {
        nodes {
            computedName
            computedAvatar
            courseUsersByUserId(condition:{courseId:$courseId}) {
                nodes {
                    role
                }
            }
        }
    }
    courseByCourseId(courseId: $courseId) {
        code
    }
}`;

interface ProfessorMetadataData {
    apiGetCurrentUser: {
        nodes: [AppUserRole]
    };
    courseByCourseId: {
        code: string
    };
}

interface MetadataVariables {
    courseId: number;
}

class ProfessorMetadataDataQuery extends Query<ProfessorMetadataData, MetadataVariables> { }

class ProfessorPeopleView extends React.Component {
    props: {
        match: {
            params: {
                courseId: number;
            }
        }
    };

    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="ProfessorView">
                <ProfessorMetadataDataQuery
                    query={METADATA_QUERY}
                    variables={{
                        courseId: this.props.match.params.courseId
                    }}
                >
                    {({ loading, data }) => {
                        var courseCode: string = 'Loading...';
                        if (!loading && data) {
                            courseCode = data.courseByCourseId.code;
                            if (data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role !== 'professor') {
                                return <Redirect to={'/course/' + this.props.match.params.courseId} />;
                            }
                        }
                        return (
                            <React.Fragment>
                                <ProfessorSidebar
                                    courseId={this.props.match.params.courseId}
                                    code={courseCode}
                                    selected={3}
                                />
                                {data && data.apiGetCurrentUser &&
                                    <TopBar
                                        courseId={this.props.match.params.courseId}
                                        user={data.apiGetCurrentUser.nodes[0]}
                                        context="professor"
                                        role={data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role}
                                    />
                                }
                            </React.Fragment>
                        );
                    }}
                </ProfessorMetadataDataQuery>

            </div>
        );
    }
}

export default ProfessorPeopleView;
