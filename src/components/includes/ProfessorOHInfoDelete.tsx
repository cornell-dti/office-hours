import React, { useState } from 'react';
import moment from 'moment';
import { Checkbox } from 'semantic-ui-react';
import firebase from "firebase/compat/app"
import { deleteSeries } from '../../firebasefunctions/series';
import { deleteSession } from '../../firebasefunctions/session';
import { useSessionTANames } from '../../firehooks';

const firestore = firebase.firestore()

type Props = {
    readonly course: FireCourse;
    readonly session: FireSession;
    readonly toggleDelete: () => void;
    readonly toggleEdit: () => void;
};

const ProfessorOHInfoDelete = ({ course, session, toggleDelete, toggleEdit }: Props) => {
    const [isChecked, setIsChecked] = useState(false);

    const toggleCheckbox = () => setIsChecked(previous => !previous);

    const _deleteSessionOrSeries = () => {
        if (isChecked) {
            const { sessionSeriesId } = session;
            if (sessionSeriesId !== undefined) {
                deleteSeries(firestore, sessionSeriesId);
            }
        } else {
            deleteSession(session.sessionId);
        }
    };

    // Convert UNIX timestamps to readable time string
    const date = moment(session.startTime.toDate()).format('dddd MM/DD/YY');
    const timeStart = moment(session.startTime.toDate()).format('h:mm A');
    const timeEnd = moment(session.endTime.toDate()).format('h:mm A');

    const disable = moment(session.startTime.toDate()).isBefore();
    const taList = useSessionTANames(course, session);

    return (
        <>
            <div className="ProfessorOHInfoDelete">
                <div className="question">
                    Are you sure you want to delete this office hour?
                </div>
                <div className="info">
                    <div className="ta">
                        {taList.join(', ')}
                        {taList.length === 0 && '(No TA Assigned)'}
                    </div>
                    <div>
                        <span>
                            {date}
                        </span>
                        <span>
                            {timeStart} to {timeEnd}
                        </span>
                        {'building' in session ? <span>
                            {session.building} {session.room}
                        </span> : <></>}
                    </div>
                </div>
                <div>
                    {/* The disabled part forces a user trying to delete a single OH to 
                    use delete button instead of checkbox for repeat deletes. */}
                    <Checkbox
                        label="Delete all office hours in this series"
                        disabled={session.sessionSeriesId === null || session.sessionSeriesId === undefined}
                        checked={isChecked}
                        onChange={toggleCheckbox}
                    />
                </div>
                {disable && <div className="EndedText">This session has already passed!</div>}
            </div>
            <button
                type="button"
                className="Delete"
                onClick={() => {
                    _deleteSessionOrSeries();
                    toggleDelete();
                    toggleEdit();
                }}
            >
                Delete
            </button>
        </>
    );
};

export default ProfessorOHInfoDelete;
