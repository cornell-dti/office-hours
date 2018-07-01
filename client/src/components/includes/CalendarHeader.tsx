import * as React from 'react';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

const QUERY = gql`
    query isUserTa($userId: Int!, $courseId: Int!) {
        courseByCourseId(courseId: $courseId) {
            courseUsersByCourseId(condition: {userId: $userId}) {
                nodes {
                    role
                }
            }
        }
    }
`;
interface InputProps {
    currentCourse: string;
    courseId: number;
    userId: number;
    data?: {
        courseByCourseId: {
            courseUsersByCourseId: {
                nodes: [{
                    role: string;
                }]
            }
        }
    };
}

const withData = graphql<InputProps, Response>(QUERY, {
    options: ({ userId, courseId }) => ({
        variables: { userId: userId, courseId: courseId }
    })
});
class CalendarHeader extends React.Component<ChildProps<InputProps, Response>> {
    render() {
        var data;
        if (this.props.data) {
            data = this.props.data;
        }
        return (
            <div className="CalendarHeader">
                <div className="CurrentCourse">
                    {this.props.currentCourse}
                    {data
                        && data.courseByCourseId
                        && data.courseByCourseId.courseUsersByCourseId
                        && data.courseByCourseId.courseUsersByCourseId.nodes[0].role === 'ta'
                        && <span className="TAMarker">TA</span>}
                    <button className="CourseSelectButton">
                        <i className="angle down icon" />
                    </button>
                </div>
            </div>
        );
    }
}

export default withData(CalendarHeader);
