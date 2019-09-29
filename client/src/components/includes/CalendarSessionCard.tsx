import * as React from 'react';
import Moment from 'react-moment';
const chevron = require('../../media/chevron.svg');

class CalendarSessionCard extends React.Component {
    props: {
        includeBookmark: boolean | null,
        numAhead: number,
        session: FireSession,
        callback: Function,
        active: boolean,
        status: string
    };

    handleOnClick = () => {
        this.props.callback(this.props.session.sessionId);
    }

    render() {
        const session = this.props.session;
        // RYAN_TODO
        const questions: FireQuestion[] = []; // session.questionsBySessionId.nodes;
        const tas: FireUser[] = []; // session.sessionTasBySessionId.nodes;

        var timeDesc = '';

        return (
            <div className={(this.props.active && 'active') + ' CalendarSessionCard'} onClick={this.handleOnClick}>
                {this.props.includeBookmark && <div className="Bookmark" />}
                <div className="TimeInfo">
                    <div className="StartTime">
                        <Moment date={session.startTime} interval={0} format={'hh:mm A'} />
                    </div>
                    <div className="EndTime">
                        <Moment date={session.endTime} interval={0} format={'hh:mm A'} />
                    </div>
                </div>
                <div className={'Indicator ' + this.props.status}>
                    <div className="Circle" />
                </div>
                <div className="CalendarCard">
                    <div className="Location">
                        {session.building + ' ' + session.room}
                    </div>
                    <div className="Tas">
                        {session.title || (tas.length > 2 ?
                            // RYAN_TODO real name
                            tas.map(ta => ta.firstName).join(', ') :
                            tas.map(ta => ta.firstName).join(' and '))}
                    </div>
                    <div className="Queue">
                        <span className="Ahead">
                            Ahead: &nbsp;
                            <span className={'AheadNum ' + (this.props.numAhead === 0 && 'zero')}>
                                {this.props.numAhead}
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
                    <img src={chevron} />
                </div>
            </div>
        );
    }
}

export default CalendarSessionCard;
