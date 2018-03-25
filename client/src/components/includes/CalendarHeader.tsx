import * as React from 'react';

class CalendarHeader extends React.Component {
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
            </div>
        );
    }
}

export default CalendarHeader;