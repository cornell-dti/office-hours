import * as React from 'react';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

const QUERY = gql`
    query isUserTa($courseId:Int!) {
        apiGetCurrentUser {
            nodes {
                courseUsersByUserId(condition:{courseId:$courseId}) {
                    nodes {
                        role
                    }
                }
            }
        }
    }
`;
interface InputProps {
    currentCourse: string;
    courseId: number;
    data?: {
        apiGetCurrentUser: {
            nodes: [{
                courseUsersByUserId: {
                    nodes: [{
                        role: string;
                    }]
                }
            }]
        }
    };
}

const withData = graphql<InputProps, Response>(QUERY, {
    options: ({ courseId }) => ({
        variables: { courseId: courseId }
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
                        && data.apiGetCurrentUser
                        && (data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role === 'ta'
                            || data.apiGetCurrentUser.nodes[0].courseUsersByUserId.nodes[0].role === 'professor')
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
