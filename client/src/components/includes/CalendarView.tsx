import React, { useState } from 'react';

import CalendarHeader from './CalendarHeader';
import CalendarDaySelect from './CalendarDaySelect';
import CalendarSessions from './CalendarSessions';

import { firestore } from './firebase';

// const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;

const CalendarView = (props: {
    courseId: string;
    sessionId: string;
    sessionCallback: Function;
    courses: FireCourse[];
}) => {
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const [selectedDateEpoch, setSelectedDateEpoch] = useState(new Date().setHours(0, 0, 0, 0));

    firestore
        .collection('sessions')
        .where('courseId', '==', props.courseId)
        .onSnapshot((querySnapshot) => {
            setLoading(false);
            // @ts-ignore TODO
            setSessions(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });

    // var selectedDate = new Date(selectedDateEpoch);
    const course = props.courses.find((c) => c.id === props.courseId);
    return (
        <aside className="CalendarView">
            <CalendarHeader
                currentCourseCode={(course && course.code) || 'Loading'}
                isTa={false} // TODO
                isProf={false} // TODO
                avatar={null} // TODO
                allCoursesList={props.courses}
            />
            <CalendarDaySelect callback={(newDateEpoch: number) => setSelectedDateEpoch(newDateEpoch)} />
            <CalendarSessions
                activeSessionId={props.sessionId}
                // eslint-disable-next-line react/jsx-curly-brace-presence
                userId={'YcfNs8Uri5RI47V8bxG4'} // data.apiGetCurrentUser && data.apiGetCurrentUser.nodes[0].userId}
                loading={loading}
                sessions={sessions}
                callback={props.sessionCallback}
                interval={(course && course.queueOpenInterval) || 0}
            />
        </aside>
    );
};

export default CalendarView;
