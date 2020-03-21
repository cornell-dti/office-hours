import * as React from 'react';
import Moment from 'react-moment';
import chevron from '../../media/chevron.svg';
import { useSessionQuestions } from '../../firehooks';

const CalendarSessionCard = (props: {
    user: FireUser;
    session: FireSession;
    callback: (sessionId: string) => void;
    active: boolean;
    status: string;
}) => {
    const handleOnClick = () => {
        props.callback(props.session.sessionId);
    };

    const session = props.session;
    const questions: FireQuestion[] = useSessionQuestions(session.sessionId);

    const unresolvedQuestions = questions.filter(question => !question.resolved);
    const userQuestions = unresolvedQuestions.filter(question => question.askerId === props.user.userId);

    const numAhead = userQuestions.length === 0
        ? unresolvedQuestions.length
        : unresolvedQuestions.filter(
            question => question.timeEntered.toDate() <= userQuestions[0].timeEntered.toDate()
        ).length - 1;

    const includeBookmark = userQuestions.length > 0;

    // RYAN_TODO: Read TA Users
    const tas: FireUser[] = []; // session.sessionTasBySessionId.nodes;

    const timeDesc = '';
    return (
        <div className={(props.active && 'active') + ' CalendarSessionCard'} onClick={handleOnClick}>
            {includeBookmark && <div className="Bookmark" />}
            <div className="TimeInfo">
                <div className="StartTime">
                    <Moment date={session.startTime.seconds * 1000} interval={0} format={'hh:mm A'} />
                </div>
                <div className="EndTime">
                    <Moment date={session.endTime.seconds * 1000} interval={0} format={'hh:mm A'} />
                </div>
            </div>
            <div className={'Indicator ' + props.status}>
                <div className="Circle" />
            </div>
            <div className="CalendarCard">
                <div className="Location">
                    {session.building + ' ' + session.room}
                </div>
                <div className="Tas">
                    {session.title ||
                        (tas.length > 2
                            ? tas.map(ta => ta.firstName + ' ' + ta.lastName).join(', ')
                            : tas.map(ta => ta.firstName + ' ' + ta.lastName).join(' and ')
                        )
                    }
                </div>
                <div className="Queue">
                    <span className="Ahead">
                        Ahead: &nbsp;
                        <span className={'AheadNum ' + (numAhead === 0 && 'zero')}>
                            {numAhead}
                        </span>
                    </span>
                    <span className="Finished">
                        Finished: &nbsp;
                        <span className="FinishedNum">
                            {questions.filter(q => q.status === 'resolved').length}
                        </span>
                    </span>
                </div>
                <div className="TimeDesc">{timeDesc}</div>
            </div>
            <div className="OpenButton">
                <img src={chevron} alt="Open session dropdown" />
            </div>
        </div>
    );
};
export default CalendarSessionCard;
