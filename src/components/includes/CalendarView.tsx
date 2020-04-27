import * as React from 'react';
import { Loader } from 'semantic-ui-react';

import CalendarHeader from './CalendarHeader';
import CalendarDaySelect from './CalendarDaySelect';
import CalendarSessions from './CalendarSessions';

import { firestore } from '../../firebase';
import { useQueryWithLoading } from '../../firehooks';
import { hasOverlap } from '../../utilities/date';

type Props = {
    session?: FireSession;
    sessionCallback: (sessionId: string) => void;
    course?: FireCourse;
    user?: FireUser;
};

const getQuery = (courseId: string) => firestore.collection('sessions').where('courseId', '==', courseId);

export default ({ session, sessionCallback, course, user }: Props) => {
    const [selectedDateEpoch, setSelectedDate] = React.useState(new Date().setHours(0, 0, 0, 0));
    const selectedDate = new Date(selectedDateEpoch);
    selectedDate.setHours(0, 0, 0, 0);
    const selectedDateEnd = new Date(selectedDate);
    selectedDateEnd.setHours(23, 59, 59);

    const sessions = useQueryWithLoading<FireSession>(
        (course && course.courseId) || '', getQuery, 'sessionId'
    );

    const filteredSessions = sessions && sessions.filter(
        s => {
            const sessionStart = s.startTime.toDate();
            const sessionEnd = s.endTime.toDate();
            return hasOverlap(sessionStart, sessionEnd, selectedDate, selectedDateEnd);
        }
    );

    return (
        <aside className="CalendarView">
            <CalendarHeader
                currentCourseCode={(course && course.code) || 'Loading'}
                role={(user && course && (user.roles[course.courseId] || 'student'))}
                avatar={user && user.photoUrl}
            />
            <CalendarDaySelect callback={setSelectedDate} />
            {course && user && sessions ?
                <CalendarSessions
                    user={user}
                    activeSession={session}
                    callback={sessionCallback}
                    course={course}
                    sessions={filteredSessions || []}
                />
                : <div className="CalendarSessions">
                    <Loader active={true} content={'Loading'} />
                </div>
            }
        </aside>
    );
};
