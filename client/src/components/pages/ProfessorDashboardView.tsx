import * as React from 'react';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
// import { Redirect } from 'react-router';
import { useCourse, useUser } from '../../firestoreHooks';

const ProfessorDashboardView = (
    props: ({
        match: {
            params: {
                courseId: string;
            };
        };
    }),
) => {
    const { courseId } = props.match.params;

    const course = useCourse(courseId);
    const user = useUser('YcfNs8Uri5RI47V8bxG4');

    return (
        <div className="ProfessorView">
            {
                /* <ProfessorMetadataDataQuery
                   query={METADATA_QUERY}
                   variables={{ courseId: '2' }}
                >
                   {({ loading, data }) => {
                       var courseCode: string = 'Loading...';
                       if (!loading && data) {
                           courseCode = data.courseByCourseId.code;
                           if (data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role !== 'professor') {
                               return <Redirect to={'/course/' + this.props.match.params.courseId} />;
                           }
                       } */
            }

            <ProfessorSidebar course={course} selected={2} />
            {user
                && <TopBar
                    courseId={courseId}
                    user={user}
                    context="professor"
                    role="professor"
                />
            }
            <section className="rightOfSidebar">
                <div className="main">
                    <p className="ComingSoon">
                        Coming soon!
                    </p>
                </div>
            </section>
        </div>
    );
};

export default ProfessorDashboardView;
