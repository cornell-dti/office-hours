import * as React from 'react';
import { Loader } from 'semantic-ui-react';

import moment from 'moment';
import CalendarHeader from './CalendarHeader';
import CalendarDaySelect from './CalendarDaySelect';
import CalendarSessions from './CalendarSessions';

import { useSessions } from '../../firefunctions';

type Props = {
    session?: FireSession;
    sessionCallback: (sessionId: string) => void;
    course?: FireCourse;
    user?: FireUser;
};

const CalendarView: React.FC<Props> = ({ session, sessionCallback, course, user }) => {
    const [selectedDateEpoch, setSelectedDate] = React.useState(new Date().setHours(0, 0, 0, 0));
    const [startDate, setSelectedStartDate] = React.useState(() => {
        const date = moment(selectedDateEpoch);
        return date.startOf('day');
    });
    const [endDate, setSelectedEndDate] = React.useState(() => {
        const date = moment(selectedDateEpoch);
        return date.endOf('day');
    });

    React.useEffect(() => {
        const date = moment(selectedDateEpoch);

        setSelectedStartDate(date.startOf('day'));
        setSelectedEndDate(date.endOf('day'));
    }, [selectedDateEpoch]);

    const sessions = useSessions(course?.courseId ?? '', startDate, endDate);

    return (
        <aside className="CalendarView">
            <CalendarHeader
                currentCourseCode={(course && course.code) || 'Loading'}
                role={(user && course && (user.roles[course.courseId] || 'student'))}
                avatar={user && user.photoUrl}
            />
            <CalendarDaySelect callback={setSelectedDate} />
            {course && user ?
                <CalendarSessions
                    user={user}
                    activeSession={session}
                    callback={sessionCallback}
                    course={course}
                    sessions={sessions}
                />
                : <div className="CalendarSessions">
                    <Loader active={true} content={'Loading'} />
                </div>
            }
        </aside>
    );
};

export default CalendarView;
