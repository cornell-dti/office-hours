import React, { useState } from 'react';
import { Icon, DropdownItemProps } from 'semantic-ui-react';
import moment from 'moment';

import ProfessorOHInfo from './ProfessorOHInfo';
import ProfessorTagInfo from './ProfessorTagInfo';
import 'react-datepicker/dist/react-datepicker.css';

import { createSeries } from '../../firebasefunctions/series';
import { firestore, Timestamp } from '../../firebase';
import { getQuery } from '../../firebasefunctions/calendar'
import { useQueryWithLoading } from '../../firehooks';
import { deleteSession } from '../../firebasefunctions/session';


enum Modality {
    VIRTUAL = 'virtual',
    HYBRID = 'hybrid',
    INPERSON = 'in-person',
    REVIEW = 'review',
}

const ProfessorAddNew = (props: { courseId: string; taOptions?: DropdownItemProps[] }) => {
    const [editVisible, setEditVisible] = useState(false);
    const [discussVisible, setDiscussVisible] = useState(false);

    const text = props.taOptions ? 'Add New Office Hour' : 'Add New Assignment';

    const generateTestSessions = () => {
        let s = Timestamp.fromDate(moment().startOf('day').toDate());
        let e = Timestamp.fromDate(moment().endOf('day').toDate())

        for (let i = 0; i < 7; i++) {
            const virtualSeries: FireSessionSeriesDefinition = {
                useTALink: false,
                modality: Modality.VIRTUAL,
                courseId: props.courseId,
                endTime: e,
                startTime: s,
                tas: [],
                title: "Virtual Session",
            };
            createSeries(firestore, virtualSeries);
            s = Timestamp.fromDate(moment(s.toDate()).add(1, 'd').toDate());
            e = Timestamp.fromDate(moment(e.toDate()).add(1, 'd').toDate());
        }
    }

    const sessions = useQueryWithLoading<FireSession>(
        props.courseId || '',
        getQuery,
        'sessionId'
    );

    const deleteAllSessions = () => {
        sessions != null && sessions.forEach((session) => {
            deleteSession(session.sessionId)
        });
    }

    return (
        <div className="ProfessorAddNew">
            <div className={'Add ' + (!editVisible && !discussVisible)}>
                <button type="button" className="NewOHButton" onClick={() => setEditVisible(true)}>
                    <Icon name="plus" />
                    {text}
                </button>
            </div>
            {props.taOptions && (
                <div className={'Add ' + (!editVisible && !discussVisible)}>
                    <button type="button" className="NewOHButton" onClick={() => setDiscussVisible(true)}>
                        <Icon name="plus" />
                        Add New Discussion
                    </button>
                </div>
            )}
            <div className={'Add ' + (!editVisible && !discussVisible)}>
                <button type="button" className="NewOHButton" onClick={generateTestSessions}>
                    <Icon name="plus" />
                    {"Auto Populate Sessions"}
                </button>
            </div>
            <div className={'Add ' + (!editVisible && !discussVisible)}>
                <button type="button" className="NewOHButton" onClick={deleteAllSessions}>
                    <Icon name="minus" />
                    {"Delete All Sessions"}
                </button>
            </div>

            <div className={'ExpandedAdd ' + editVisible}>
                <div className="NewOHHeader">
                    <button
                        type="button"
                        className="ExpandedNewOHButton"
                        onClick={() => setEditVisible(false)}
                    >
                        <Icon name="plus" />
                        {text}
                    </button>
                </div>
                {props.taOptions ? (
                    <ProfessorOHInfo
                        courseId={props.courseId}
                        isNewOH={true}
                        taOptions={props.taOptions}
                        toggleEdit={() => setEditVisible(false)}
                        // taUserIdsDefault={[]}
                        isOfficeHour={true}
                    />
                ) : (
                    <ProfessorTagInfo
                        isNew={true}
                        cancelCallback={() => setEditVisible(false)}
                        courseId={props.courseId}
                        // RYAN_TODO Figure out how to add tags all at once
                        childTags={[]}
                    />
                )}
            </div>
            <div className={'ExpandedAdd ' + discussVisible}>
                <div className="NewOHHeader">
                    <button
                        type="button"
                        className="ExpandedNewOHButton"
                        onClick={() => setDiscussVisible(false)}
                    >
                        <Icon name="plus" />
                        Add New Discussion
                    </button>
                </div>
                {props.taOptions && (
                    <ProfessorOHInfo
                        courseId={props.courseId}
                        isNewOH={true}
                        taOptions={props.taOptions}
                        toggleEdit={() => setDiscussVisible(false)}
                        // taUserIdsDefault={[]}
                        isOfficeHour={false}
                    />
                )}
            </div>
        </div>
    );
};

ProfessorAddNew.defaultProps = {
    taOptions: undefined,
};

export default ProfessorAddNew;
