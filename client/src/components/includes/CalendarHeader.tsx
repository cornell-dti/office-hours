import * as React from 'react';

class CalendarHeader extends React.Component {
    props: {
        currentCourse: string;
        courseId: number;
        isTa: boolean;
    };

    render() {
        return (
            <div className="CalendarHeader">
                <div className="CurrentCourse">
                    {this.props.currentCourse}
                    {this.props.isTa && <span className="TAMarker">TA</span>}
                    {/* <button className="CourseSelectButton">
                        <i className="angle down icon" />
                    </button> */}
                </div>
            </div>
        );
    }
}

export default CalendarHeader;
