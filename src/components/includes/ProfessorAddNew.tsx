import React, { useState } from 'react';
import { Icon, DropdownItemProps } from 'semantic-ui-react';
import ProfessorOHInfo from './ProfessorOHInfo';
import ProfessorTagInfo from './ProfessorTagInfo';
import 'react-datepicker/dist/react-datepicker.css';

const ProfessorAddNew = (props: { courseId: string; taOptions?: DropdownItemProps[] }) => {
    const [editVisible, setEditVisible] = useState(false);
    const [discussVisible, setDiscussVisible] = useState(false);

    const text = props.taOptions ? 'Add New Office Hour' : 'Add New Assignment';
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
