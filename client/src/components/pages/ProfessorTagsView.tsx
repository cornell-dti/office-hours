import * as React from 'react';
import ProfessorTagsTable from '../includes/ProfessorTagsTable';
import ProfessorAddNew from '../includes/ProfessorAddNew';
// import TopBar from '../includes/TopBar';
// import ProfessorSidebar from '../includes/ProfessorSidebar';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Redirect } from 'react-router';
import { Loader } from 'semantic-ui-react';

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

const TAGS_QUERY = gql`
query FindTagsByCourse($courseId: Int!) {
    courseByCourseId(courseId: $courseId) {
        code
        tagsByCourseId(condition:{level:1}) {
            nodes {
              	tagId
                name
                level
                activated
              	tagRelationsByParentId {
                  nodes {
                    tagByChildId {
                      tagId
                      name
                      level
                      activated
                    }
                  }
                }
            }
        }
    }
}
`;

interface ProfessorMetadataData {
    apiGetCurrentUser: {
        nodes: [AppUserRole]
    };
    courseByCourseId: {
        code: string
    };
}

interface ProfessorTagsData {
    courseByCourseId: {
        tagsByCourseId: {
            nodes: [AppTag]
        }
    };
}

interface MetadataVariables {
    courseId: string;
}

interface TagsVariables {
    courseId: string;
}

class ProfessorTagsDataQuery extends Query<ProfessorTagsData, TagsVariables> { }
class ProfessorMetadataDataQuery extends Query<ProfessorMetadataData, MetadataVariables> { }

class ProfessorView extends React.Component {
    props: {
        match: {
            params: {
                courseId: string;
            }
        }
    };

    constructor(props: {}) {
        super(props);
    }

    render() {
        let courseId = this.props.match.params.courseId;
        return (
            <div className="ProfessorView">
                <ProfessorMetadataDataQuery query={METADATA_QUERY} variables={{ courseId: courseId }} >
                    {({ loading, data }) => {
                        // var courseCode: string = 'Loading...';
                        if (!loading && data) {
                            // courseCode = data.courseByCourseId.code;
                            if (data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role !== 'professor') {
                                return <Redirect to={'/course/' + this.props.match.params.courseId} />;
                            }
                        }
                        return (
                            <React.Fragment>
                                {/* <ProfessorSidebar
                                    courseId={courseId}
                                    code={courseCode}
                                    selected={1}
                                />
                                {data && data.apiGetCurrentUser &&
                                    <TopBar
                                        courseId={courseId}
                                        user={data.apiGetCurrentUser.nodes[0]}
                                        context="professor"
                                        role={data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role}
                                    />
                                } */}
                            </React.Fragment>
                        );
                    }}
                </ProfessorMetadataDataQuery>

                <ProfessorTagsDataQuery query={TAGS_QUERY} variables={{ courseId: courseId }} >
                    {({ loading, data, refetch }) => {
                        return (
                            <section className="rightOfSidebar">
                                <div className="main">
                                    <ProfessorAddNew
                                        courseId={courseId}
                                        refreshCallback={refetch}
                                    />
                                    {loading && <Loader active={true} content={'Loading...'} />}
                                    {!loading && data && data.courseByCourseId.tagsByCourseId.nodes.length > 0 &&
                                        <div className="Calendar">
                                            <ProfessorTagsTable
                                                tags={data.courseByCourseId.tagsByCourseId.nodes}
                                                refreshCallback={refetch}
                                                courseId={courseId}
                                            />
                                        </div>
                                    }
                                </div>
                            </section>
                        );
                    }}
                </ProfessorTagsDataQuery>
            </div>
        );
    }
}

export default ProfessorView;
