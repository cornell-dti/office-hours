import * as React from 'react';
import TopBar from '../includes/TopBar';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
const QMeLogo = require('../../media/QLogo2.svg');
import CourseCard from '../includes/CourseCard';

const DEFAULT_COURSE_ID = String(window.localStorage.getItem('lastid') || 1);

const METADATA_QUERY = gql`
query GetMetadata {
    apiGetCurrentUser {
        nodes {
            computedName
            computedAvatar
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

class CourseSelection extends React.Component {
    props: {
        isEdit: boolean;
    };

    state: {
        selectedCourses: AppCourse[];
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            selectedCourses: []
        };

        this.selectCourse = this.selectCourse.bind(this);
    }

    selectCourse(course: AppCourse, addCourse: boolean) {
        var updatedCourses = this.state.selectedCourses;
        if (addCourse) {
            updatedCourses.push(course);
        } else {
            updatedCourses = updatedCourses.filter(c => c !== course);
        }
        this.setState({
            selectedCourses: updatedCourses
        });
    }

    render() {
        return (
            <div>
                <CoursesDataQuery
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
                                        selectCourse={this.props.isEdit ? this.selectCourse : undefined}
                                        selected={this.props.isEdit ?
                                            (this.state.selectedCourses.indexOf(course) !== -1) : undefined}
                                    />
                                );
                            }
                        );
                        return (
                            <React.Fragment>
                                <img src={QMeLogo} className="QMeLogo course" />
                                {data && data.apiGetCurrentUser && data.apiGetCurrentUser.nodes &&
                                    <TopBar
                                        user={data.apiGetCurrentUser.nodes[0]}
                                        role={'student'}
                                        context="session"
                                        courseId={courseId}
                                    />
                                }
                                <div className="CourseSelection">
                                    <div className="description">
                                        <div className="title">
                                            {this.props.isEdit ?
                                                'Edit Your Classes' : 'My Classes'}
                                        </div>
                                        <div className="subtitle">
                                            {this.props.isEdit ?
                                                'Add or remove classes.' : 'Select the office hours you want to view.'}
                                        </div>
                                    </div>
                                    <div className="CourseCards">
                                        {cards}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    }}
                </CoursesDataQuery>
                {this.props.isEdit && <div className="EnrollBar">
                    <div className="EnrolledCourses">
                        {this.state.selectedCourses.length === 0 ?
                            'No Classes Chosen' :
                            this.state.selectedCourses.map(c => c.code).join(', ')
                        }
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
