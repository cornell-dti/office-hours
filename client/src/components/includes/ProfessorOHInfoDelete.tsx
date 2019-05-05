import React, { useState } from 'react';
import moment from 'moment';
import { Checkbox } from 'semantic-ui-react';

const ProfessorOHInfoDelete = (props: {
    session: FireSession;
    toggleDelete: Function;
    toggleEdit: Function;
    refreshCallback: Function;
}) => {
    const [isChecked, setIsChecked] = useState(false);

    // Convert UNIX timestamps to readable time string
    const date = moment(props.session.startTime.seconds * 1000).format('dddd MM/DD/YY');
    const timeStart = moment(props.session.startTime.seconds * 1000).format('h:mm A');
    const timeEnd = moment(props.session.endTime.seconds * 1000).format('h:mm A');

    const disable = moment(props.session.startTime.seconds * 1000).isBefore();
    // let taList = props.session.sessionTasBySessionId.nodes.map(ta => ta.userByUserId.computedName);

    return (
        <React.Fragment>
            <div className="ProfessorOHInfoDelete">
                <div className="question">
                    Are you sure you want to delete this office hour?
                </div>
                <div className="info">
                    <div className="ta">
                        {/* TODO */}
                        {/* {taList.join(', ')}
                        {taList.length === 0 && '(No TA Assigned)'} */}
                    </div>
                    <div>
                        <span>
                            {date}
                        </span>
                        <span>
                            {`${timeStart} to ${timeEnd}`}
                        </span>
                        <span>
                            {`${props.session.building} ${props.session.room}`}
                        </span>
                    </div>
                </div>
                <div>
                    <Checkbox
                        label="Delete all office hours in this series"
                        disabled={props.session.sessionSeriesId === null}
                        checked={isChecked}
                        onChange={() => setIsChecked(!isChecked)}
                    />
                </div>
                {disable && (
                    <div className="EndedText">
                        This session has already passed!
                    </div>
                )}
            </div>
            {isChecked
                ? (
                    <button
                        className="Delete"
                        onClick={(e) => {
                            // _onClickDeleteSeries(e, DeleteSeries);
                            props.toggleDelete();
                            props.toggleEdit();
                        }}
                        disabled={disable}
                        type="button"
                    >
                        Delete
                    </button>
                ) : (
                    <button
                        className="Delete"
                        onClick={(e) => {
                            // _onClickDeleteSession(e, DeleteSession);
                            props.toggleDelete();
                            props.toggleEdit();
                        }}
                        disabled={disable}
                        type="button"
                    >
                        Delete
                    </button>
                )
            }
        </React.Fragment>
    );
};

export default ProfessorOHInfoDelete;
