import * as React from 'react';
import '../../styles/CalendarHeader.css';

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
                <button className="MenuButton">
                    <i className="bars icon" />
                </button>
            </div>
        );
    }
}

export default CalendarHeader;