import * as React from 'react';

class CalendarHeader extends React.Component {
    props: {
        currentCourse: string,
        isTA: boolean
    };

    render() {
        return (
            <div className="CalendarHeader">
                <div className="CurrentCourse">
                    {this.props.currentCourse}
                    {this.props.isTA && <span className="TAMarker">TA</span>}
                    <button className="CourseSelectButton">
                        <i className="angle down icon" />
                    </button>
                </div>
            </div>
        );
    }
}

export default CalendarHeader;