import * as React from 'react';
import '../../styles/CalendarHeader.css';
import gql from 'graphql-tag';
import { graphql, ChildProps } from 'react-apollo';

/*class CalendarHeader extends React.Component {
    props: {
        currentCourse: string
    };

    render() {
        return (
            <div className="CalendarHeader">
                <div className="CurrentCourse">
                    {this.props.currentCourse}
                    <button className="CourseSelectButton">
                        <i className="angle down icon" />
                    </button>
                </div>
                <button className="MenuButton">
                    <i className="bars icon" />
                </button>
            </div>
        );
    }
}*/

const COURSE_QUERY = gql`
query getCourseDetails($c:String!) {
    course(name: $c) {
        name
        semester
    }
}`;

type Response = {
    course: {
        name: string,
        semester: string
    }
};

type InputProps = {
    currentCourse: string
};

const finalQuery = graphql<Response, InputProps>(COURSE_QUERY, {
    options: ({ currentCourse }) => ({
        variables: { c: currentCourse }
    }),
});

class CalendarHeader extends React.Component<ChildProps<InputProps, Response>, {}> {
    render() {
        if (this.props.data.loading) {
            return <div>Loading</div>;
        }
        if (this.props.data.error) {
            return <h1>ERROR</h1>;
        }
        return (
            <div className="CalendarHeader">
                <div className="CurrentCourse">
                    {this.props.data.course.name + ', ' + this.props.data.course.semester}
                    <button className="CourseSelectButton">
                        <i className="angle down icon" />
                    </button>
                </div>
                <button className="MenuButton">
                    <i className="bars icon" />
                </button>
            </div>
        );
    }
}

export default finalQuery(CalendarHeader);