import * as React from 'react';

class CalendarHeader extends React.PureComponent {
    props: {
        currentCourseCode: string;
        isTa: boolean;
        avatar: string | null;
    };

    render() {
        return (
            <div className="CalendarHeader">
                <div className="CurrentCourse">
                    {this.props.currentCourseCode}
                    {this.props.isTa && <span className="TAMarker">TA</span>}
                    {this.props.avatar && <img className="mobileHeaderFace" src={this.props.avatar} />}
                    {/* <button className="CourseSelectButton">
                        <i className="angle down icon" />
                    </button> */}
                </div>
            </div>
        );
    }
}

export default CalendarHeader;
