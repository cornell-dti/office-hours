import React from 'react';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import chevron from '../../media/chevron.svg';
import { useSessionQuestions, useSessionTANames } from '../../firehooks';
import {
    filterAndpartitionQuestions,
    computeNumberAheadFromFilterAndpartitionQuestions,
} from '../../utilities/questions';
import { RootState } from '../../redux/store';

const CalendarSessionCard = (props: {
    user: FireUser;
    course: FireCourse;
    session: FireSession;
    callback: (sessionId: string) => void;
    active: boolean;
    status: string;
    setIsDayExport: React.Dispatch<React.SetStateAction<boolean>>;
    setShowCalendarModal: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentExportSessions: React.Dispatch<React.SetStateAction<FireSession[]>>;
}) => {
    const handleOnClick = () => {
        props.callback(props.session.sessionId);
    };

    const session = props.session;
    const isTA = props.user.roles[session.courseId] !== undefined;
    const questions: FireQuestion[] = useSessionQuestions(
        session.sessionId,
        isTA
    );

    const [unresolvedQuestions, userQuestions] = filterAndpartitionQuestions(
        questions,
        props.user.userId
    );
    const numAhead = computeNumberAheadFromFilterAndpartitionQuestions(
        unresolvedQuestions,
        userQuestions
    );

    //const includeBookmark = userQuestions.length > 0;

    const tas = useSessionTANames(props.course, session);

    const timeDesc = '';

    const showCalendarExportModal = () => {
        props.setCurrentExportSessions([session]);
        props.setShowCalendarModal(true);
        props.setIsDayExport(false);
    };

    return (
        <div
            className={(props.active && 'active') + ' CalendarSessionCard'}
            onClick={handleOnClick}
        >
            {/* {includeBookmark && <div className='Bookmark' />} */}
            <div className='TimeInfo'>
                <div className='StartTime'>
                    <Moment
                        date={session.startTime.seconds * 1000}
                        interval={0}
                        format={'hh:mm A'}
                    />
                </div>
                <div className='EndTime'>
                    <Moment
                        date={session.endTime.seconds * 1000}
                        interval={0}
                        format={'hh:mm A'}
                    />
                </div>
                <div className='Wrapper'>
                    <div
                        className={
                            (session.modality !== 'review' && 'Office') +
                            ' Type'
                        }
                    >
                        {session.modality !== 'review' ? 'OH' : 'Discussion'}
                    </div>
                </div>
            </div>

            <div className='CalendarCard'>
                <div className='Wrapper'>
                    {'building' in session ? (
                        <div className='Location'>
                            {session.building + ' ' + session.room}
                        </div>
                    ) : session.modality === 'review' ? (
                        <div className='Location'> Zoom Discussion </div>
                    ) : (
                        <div className='Location'>Online</div>
                    )}

                    {numAhead > 0 ? (<div className={'Indicator ' + props.status}>
                        <div className='Circle' />
                    </div>) : null}

                    <button
                        type="button"
                        className="cal-btn"
                        onClick={showCalendarExportModal}
                    >+ Add to Cal</button>
                </div>
                <div className='Tas'>
                    {session.title ||
                        (tas.length > 2 ? tas.join(', ') : tas.join(' and '))}
                </div>
                <div className='Queue'>
                    <span className='Ahead'>
                        Ahead: &nbsp;
                        <span
                            className={
                                'AheadNum ' + (numAhead === 0 && 'zero')
                            }
                        >
                            {numAhead}
                        </span>
                    </span>
                    <span className='Finished'>
                        Finished: &nbsp;
                        <span className='FinishedNum'>
                            {
                                questions.filter((q) => q.status === 'resolved')
                                    .length
                            }
                        </span>
                    </span>
                </div>
                <div className='TimeDesc'>{timeDesc}</div>
            </div>
            <div className='OpenButton'>
                <img src={chevron} alt='Open session dropdown' />
            </div>
        </div>
    );
};

const mapStateToProps = (state: RootState) => ({
    user: state.auth.user
})


export default connect(mapStateToProps, {})(CalendarSessionCard);
