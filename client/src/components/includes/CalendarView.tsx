import * as React from 'react';
import { Loader } from 'semantic-ui-react';

import CalendarHeader from './CalendarHeader';
import CalendarDaySelect from './CalendarDaySelect';
import CalendarSessions from './CalendarSessions';

class CalendarView extends React.Component {
    props!: {
        session?: FireSession,
        sessionCallback: (sessionId: string) => void,
        course?: FireCourse,
        courseUser?: FireCourseUser
    };

    state!: {
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
        // let selectedDate = new Date(this.state.selectedDateEpoch);

        return (
            <aside className="CalendarView">
                <CalendarHeader
                    currentCourseCode={(this.props.course && this.props.course.code) || 'Loading'}
                    role={(this.props.courseUser && this.props.courseUser.role)}
                // avatar={data.apiGetCurrentUser && data.apiGetCurrentUser.nodes[0].computedAvatar}
                />
                <CalendarDaySelect callback={this.handleDateClick} />
                {this.props.course ?
                    <CalendarSessions
                        activeSession={this.props.session}
                        callback={this.props.sessionCallback}
                        course={this.props.course}
                    />
                    : <div className="CalendarSessions">
                        <Loader active={true} content={'Loading'} />
                    </div>
                }
            </aside>
        );
    }
}

export default CalendarView;
