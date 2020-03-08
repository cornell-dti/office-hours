import * as React from 'react';
// import TopBar from '../includes/TopBar';
// import gql from 'graphql-tag';
// import { Query } from 'react-apollo';
// import QMeLogo from '../../media/QLogo2.svg';
// import CourseCard from '../includes/CourseCard';

const DEFAULT_COURSE_ID = String(window.localStorage.getItem('lastid') || 1);

/*
const METADATA_QUERY = gql`
query GetMetadata {
    apiGetCurrentUser {
        nodes {
            computedName
            computedAvatar
            courseUsersByUserId {
                nodes {
                    role
                    courseId
                }
            }
        }
    }
    allCourses {
        nodes {
            courseId
            code
            name
            semester
        }
    }
}`;

interface CoursesData {
    apiGetCurrentUser: {
        nodes: [AppUserRole]
    };
    allCourses: {
        nodes: [AppCourse]
    };
}

class CoursesDataQuery extends Query<CoursesData> { }
*/

type Props = { isEdit: boolean };
type State = { selectedCourses: readonly FireCourse[] };

class CourseSelection extends React.Component<Props, State> {
    state: State = { selectedCourses: [] };

    selectCourse = (course: FireCourse, addCourse: boolean) => {
        this.setState(({ selectedCourses }) => ({
            selectedCourses: addCourse
                ? [...selectedCourses, course]
                : selectedCourses.filter(c => c !== course)
        }));
    };

    render() {
        const selectedCourses = this.state.selectedCourses.length === 0 ?
            'No Classes Chosen' : this.state.selectedCourses.map(c => c.code).join(', ');

        return (
            <div>
                {/*<CoursesDataQuery
                    query={METADATA_QUERY}
                >
                    {({ loading, data }) => {
                        if (!data || !data.allCourses || !data.allCourses.nodes) { return <div>Loading...</div>; }
                        let courseId = 1;
                        var cards = data.allCourses.nodes.map(
                            (course, i) => {
                                return (
                                    <CourseCard
                                        key={i}
                                        course={course}
                                        role={data.apiGetCurrentUser && data.apiGetCurrentUser.nodes[0]
                                            .courseUsersByUserId.nodes[i].role}
                                        selectCourse={this.props.isEdit ? this.selectCourse : undefined}
                                        selected={this.props.isEdit ?
                                            (this.state.selectedCourses.indexOf(course) !== -1) : undefined}
                                    />
                                );
                            }
                        );
                        return (
                            <div className="CourseSelection">
                                <img src={QMeLogo} className="QMeLogo course" />
                                {data && data.apiGetCurrentUser && data.apiGetCurrentUser.nodes &&
                                    <TopBar
                                        user={data.apiGetCurrentUser.nodes[0]}
                                        role={'student'}
                                        context="session"
                                        courseId={courseId}
                                    />
                                }
                                <div className="selectionContent">
                                    <div className="description">
                                        <div className="title">
                                            {this.props.isEdit ?
                                                'Edit Your Classes' : 'My Classes'}
                                        </div>
                                        <div className="subtitle">
                                            {this.props.isEdit ?
                                                'Add or remove classes.' : 'Select the office hours you want to view.'}
                                            <div className="EnrolledCourses mobile">
                                                {selectedCourses}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="CourseCards">
                                        {cards}
                                    </div>
                                </div>
                            </div>
                        );
                    }}
                </CoursesDataQuery> */}
                {this.props.isEdit && <div className="EnrollBar">
                    <div className="EnrolledCourses web">
                        {selectedCourses}
                    </div>
                    <div className="buttons">
                        <button className={'save' + (this.state.selectedCourses.length === 0 ? ' disabled' : '')}>
                            Save
                        </button>
                        <form action={'/course/' + DEFAULT_COURSE_ID} method="get">
                            <button className="cancel">
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>}
            </div>
        );
    }
}

export default CourseSelection;
