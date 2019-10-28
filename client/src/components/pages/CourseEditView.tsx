import * as React from 'react';
import TopBar from '../includes/TopBar';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import CourseCard from '../includes/CourseCard';

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

class CourseEditView extends React.Component {
    props: {
        match: {
            params: {
                userId: string;
            }
        }
    };

    state: {
        selectedCourses: number[];
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            selectedCourses: []
        };
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
                                    />
                                );
                            }
                        );
                        return (
                            <React.Fragment>
                                {data && data.apiGetCurrentUser && data.apiGetCurrentUser.nodes &&
                                    <TopBar
                                        user={data.apiGetCurrentUser.nodes[0]}
                                        role={'student'}
                                        context="session"
                                        courseId={courseId}
                                    />
                                }
                                <div className="CourseEditView">
                                    <div className="description">
                                        <div className="title">
                                            Edit Your Classes
                                        </div>
                                        <div className="directions">
                                            Add or remove classes
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
            </div>
        );
    }
}

export default CourseEditView;
