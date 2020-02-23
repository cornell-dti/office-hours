import * as React from 'react';
import ProfessorTagsTable from '../includes/ProfessorTagsTable';
import ProfessorAddNew from '../includes/ProfessorAddNew';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import { useMyUser, useCourse } from '../../firehooks';

function withData<T extends { match: { params: { courseId: string; } } }>
    (Component: React.ComponentType<T>) {
    return (props: T) => {
        const courseId = props.match.params.courseId;
        const user = useMyUser();
        const course = useCourse(courseId);

        return (<Component {...props} user={user} course={course} />);
    };
}

type Props = {
    match: {
        params: {
            courseId: string;
        }
    };
    user?: FireUser;
    course?: FireCourse;
};

class ProfessorTagsView extends React.Component<Props> {
    render() {
        let courseId = this.props.match.params.courseId;
        return (
            <div className="ProfessorView">
                <ProfessorSidebar
                    courseId={courseId}
                    code={this.props.course ? this.props.course.code : 'Loading...'}
                    selected={1}
                />
                <TopBar
                    courseId={this.props.match.params.courseId}
                    user={this.props.user}
                    context="professor"
                    role="professor"
                />

                <section className="rightOfSidebar">
                    <div className="main">
                        <ProfessorAddNew courseId={courseId} />
                        <div className="Calendar">
                            <ProfessorTagsTable courseId={courseId} />
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default withData(ProfessorTagsView);
