import React, { useState } from 'react';
import moment from 'moment';
import { Checkbox } from 'semantic-ui-react';
import { firestore } from '../../firebase';
import { deleteSeries } from '../../../backend/src/firebasefunctions';
import { useSessionTANames } from '../../firehooks';

// const DELETE_SESSION = gql`
//     mutation DeleteSession($_sessionId: Int!) {
//         apiDeleteSession(input: {_sessionId: $_sessionId}) {
//             clientMutationId
//         }
//     }
// `;

// const DELETE_SERIES = gql`
//     mutation DeleteSeries($_seriesId: Int!) {
//         apiDeleteSeries(input: {_seriesId: $_seriesId}) {
//             clientMutationId
//         }
//     }
// `;

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
            firestore.collection('sessions').doc(session.sessionId).delete();
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
                        {session.modality !== "virtual" ? <span>
                            {session.building} {session.room}
                        </span> : <></>}
                    </div>
                </div>
                <div>
                    <Checkbox
                        label="Delete all office hours in this series"
                        disabled={session.sessionSeriesId === null}
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
                disabled={disable}
            >
                Delete
            </button>
        </>
    );
};

export default ProfessorOHInfoDelete;
