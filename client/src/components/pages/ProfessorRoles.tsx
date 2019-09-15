import * as React from 'react';
// import TopBar from '../includes/TopBar';
// import ProfessorSidebar from '../includes/ProfessorSidebar';
import ProfessorRolesTable from '../includes/ProfessorRolesTable';
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
        courseUsersByCourseIdList {
          role
          userByUserId {
            firstName
            lastName
            email
            userId
          }
        }
    }
}`;

interface ProfessorMetadataData {
    apiGetCurrentUser: {
        nodes: [AppUserRole]
    };
    courseByCourseId: {
        code: string;
        courseUsersByCourseIdList: [{
            role: string;
            userByUserId: FireUser;
        }]
    };
}

interface MetadataVariables {
    courseId: string;
}

class ProfessorMetadataDataQuery extends Query<ProfessorMetadataData, MetadataVariables> { }

type Props = {
    match: {
        params: {
            courseId: string;
        }
    }
};

class ProfessorDashboardView extends React.Component<Props> {

    render() {
        let courseId = this.props.match.params.courseId;
        return (
            <div className="ProfessorView">
                <ProfessorMetadataDataQuery query={METADATA_QUERY} variables={{ courseId: '2' }} >
                    {({ loading, data }) => {
                        // var courseCode: string = 'Loading...';
                        if (!loading && data) {
                            // const courseCode = data.courseByCourseId.code;
                            // Redirect if current user != professor
                            if (data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role !== 'professor') {
                                return <Redirect to={'/course/' + this.props.match.params.courseId} />;
                            }
                        }
                        return (
                            <React.Fragment>
                                {/* <ProfessorSidebar
                                    courseId={courseId}
                                    code={courseCode}
                                    selected={4}
                                />
                                {data && data.apiGetCurrentUser &&
                                    <TopBar
                                        courseId={courseId}
                                        user={data.apiGetCurrentUser.nodes[0]}
                                        context="professor"
                                        role={data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role}
                                    />
                                } */}
                                <section className="rightOfSidebar">
                                    <div className="main">
                                        {data && data.courseByCourseId &&
                                            <ProfessorRolesTable
                                                courseId={courseId}
                                                data={data.courseByCourseId.courseUsersByCourseIdList}
                                            />
                                        }
                                    </div>
                                </section>
                            </React.Fragment>
                        );
                    }}
                </ProfessorMetadataDataQuery>
            </div>
        );
    }
}

export default ProfessorDashboardView;
