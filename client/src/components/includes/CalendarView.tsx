import * as React from 'react';

import CalendarHeader from './CalendarHeader';
import CalendarDaySelect from './CalendarDaySelect';
import CalendarSessions from './CalendarSessions';

import { firestore } from './firebase';

// const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;

class CalendarView extends React.Component {
    props: {
        courseId: string,
        sessionId: string,
        sessionCallback: Function,
        courses: FireCourse[]
    };

    state: {
        selectedDateEpoch: number,
        sessions: FireSession[],
        loading: boolean;
    };

    constructor(props: {}) {
        super(props);
        this.state = { selectedDateEpoch: new Date().setHours(0, 0, 0, 0), sessions: [], loading: true };
        firestore
            .collection('sessions')
            .where('courseId', '==', this.props.courseId)
            .onSnapshot((querySnapshot) => {
                this.setState({
                    loading: false,
                    sessions: querySnapshot.docs.map((doc) => {
                        return { 'id': doc.id, ...doc.data() };
                    })
                });
            });
    }

    handleDateClick = (newDateEpoch: number) => {
        this.setState({ selectedDateEpoch: newDateEpoch });
    }

    render() {
        // var selectedDate = new Date(this.state.selectedDateEpoch);
        let course = this.props.courses.find((c) => c.id === this.props.courseId);
        return (
            <aside className="CalendarView">
                <CalendarHeader
                    currentCourseCode={course && course.code || 'Loading'}
                    isTa={false} // TODO
                    isProf={false} // TODO
                    avatar={null} // TODO
                    allCoursesList={this.props.courses}
                />
                <CalendarDaySelect callback={this.handleDateClick} />
                <CalendarSessions
                    activeSessionId={this.props.sessionId}
                    userId={'YcfNs8Uri5RI47V8bxG4'} // data.apiGetCurrentUser && data.apiGetCurrentUser.nodes[0].userId}
                    loading={this.state.loading}
                    sessions={this.state.sessions}
                    callback={this.props.sessionCallback}
                    interval={course && course.queueOpenInterval || 0}
                />
            </aside>
        );
    }
}

export default CalendarView;
