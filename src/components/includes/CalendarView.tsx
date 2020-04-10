import * as React from 'react';
import { Loader } from 'semantic-ui-react';

import CalendarHeader from './CalendarHeader';
import CalendarDaySelect from './CalendarDaySelect';
import CalendarSessions from './CalendarSessions';

import { firestore } from '../../firebase';
import { useQueryWithLoading } from '../../firehooks';
import { datePlus } from '../../utilities/date';
import moment from 'moment';

type Props = {
    session?: FireSession;
    sessionCallback: (sessionId: string) => void;
    course?: FireCourse;
    user?: FireUser;
};

const getQuery = (courseId: string) => firestore.collection('sessions').where('courseId', '==', courseId);

const ONE_DAY = 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* millis */;

export default ({ session, sessionCallback, course, user }: Props) => {
    const [selectedDateEpoch, setSelectedDate] = React.useState(new Date().setHours(0, 0, 0, 0));
    const selectedDate = moment(new Date(selectedDateEpoch));

    const sessions = useQueryWithLoading<FireSession>(
        (course && course.courseId) || '', getQuery, 'sessionId'
    );
    
    const filteredSessions = sessions && sessions.filter(session => {
       const start =  moment(session.startTime.toDate());
       const end = moment(session.endTime.toDate());

       return start.isSame(selectedDate, 'day') || end.isSame(selectedDate, 'day');
    });

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
                    sessions={filteredSessions || []}
                />
                : <div className="CalendarSessions">
                    <Loader active={true} content={'Loading'} />
                </div>
            }
        </aside>
    );
};
