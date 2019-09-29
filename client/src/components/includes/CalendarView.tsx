import * as React from 'react';

import CalendarHeader from './CalendarHeader';
import CalendarDaySelect from './CalendarDaySelect';
import CalendarSessions from './CalendarSessions';

class CalendarView extends React.Component {
    props: {
        session?: FireSession,
        sessionCallback: Function,
        course?: FireCourse,
        courseUser?: FireCourseUser
    };

    state: {
        selectedDateEpoch: number,
        userId?: string,
    };

    constructor(props: {}) {
        super(props);
        this.state = { selectedDateEpoch: new Date().setHours(0, 0, 0, 0) };
    }

    handleDateClick = (newDateEpoch: number) => {
        this.setState({ selectedDateEpoch: newDateEpoch });
    }

    render() {
        // var selectedDate = new Date(this.state.selectedDateEpoch);

        return (
            <aside className="CalendarView">
                <CalendarHeader
                    currentCourseCode={this.props.course && this.props.course.code || 'Loading'}
                    role={(this.props.courseUser && this.props.courseUser.role)}
                // avatar={data.apiGetCurrentUser && data.apiGetCurrentUser.nodes[0].computedAvatar}
                />
                <CalendarDaySelect callback={this.handleDateClick} />
                <CalendarSessions
                    activeSession={this.props.session}
                    callback={this.props.sessionCallback}
                    interval={this.props.course && this.props.course.queueOpenInterval || 0}
                />
            </aside>
        );
    }
}

export default CalendarView;
