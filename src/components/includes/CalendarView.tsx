import * as React from 'react';
import { Loader } from 'semantic-ui-react';

import { connect } from 'react-redux';
import CalendarDaySelect from './CalendarDaySelect';
import CalendarSessions from './CalendarSessions';

import { useQueryWithLoading } from '../../firehooks';
import { hasOverlap } from '../../utilities/date';
import { getQuery } from '../../firebasefunctions/calendar';
import { RootState } from '../../redux/store';

type Props = {
    session?: FireSession;
    sessionCallback: (sessionId: string) => void;
    course?: FireCourse;
    user?: FireUser;
    isActiveSession: boolean;
    setShowCalendarModal: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDayExport: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentExportSessions: React.Dispatch<React.SetStateAction<FireSession[]>>;
};

const CalenderView = ({
    session,
    sessionCallback,
    course,
    user,
    isActiveSession,
    setShowCalendarModal,
    setIsDayExport,
    setCurrentExportSessions,
}: Props) => {
    const [selectedDateEpoch, setSelectedDate] = React.useState(
        new Date().setHours(0, 0, 0, 0)
    );
    const selectedDate = new Date(selectedDateEpoch);
    selectedDate.setHours(0, 0, 0, 0);
    const selectedDateEnd = new Date(selectedDate);
    selectedDateEnd.setHours(23, 59, 59);

    const sessions = useQueryWithLoading<FireSession>(
        (course && course.courseId) || '',
        getQuery,
        'sessionId'
    );

    const filteredSessions =
        sessions &&
        sessions.filter((s) => {
            const sessionStart = s.startTime.toDate();
            const sessionEnd = s.endTime.toDate();
            return hasOverlap(
                sessionStart,
                sessionEnd,
                selectedDate,
                selectedDateEnd
            );
        }).sort((a: FireSession, b: FireSession) => {
            const aStart = a.startTime;
            const bStart = b.startTime;
            return aStart.toDate().getTime() - bStart.toDate().getTime();
        });
    
    const sessionDates = sessions === null ? [] : sessions.map((s) => s.startTime.toDate());

    return (
        <aside className='CalendarView'>
            <CalendarDaySelect 
                callback={setSelectedDate} 
                sessionDates={sessionDates} 
            />
            {course && user && sessions ? (
                <CalendarSessions
                    activeSession={isActiveSession? session : undefined}
                    callback={sessionCallback}
                    course={course}
                    sessions={filteredSessions || []}
                    setShowCalendarModal={setShowCalendarModal}
                    setIsDayExport={setIsDayExport}
                    setCurrentExportSessions={setCurrentExportSessions}
                />
            ) : (
                <div className='CalendarSessions'>
                    <Loader active={true} content={'Loading'} />
                </div>
            )}
        </aside>
    );
};

CalenderView.defaultProps = {
    session: undefined,
    course: undefined,
    user: undefined,
};

const mapStateToProps = (state: RootState) => ({
    user : state.auth.user
})

export default connect(mapStateToProps, {})(CalenderView);
