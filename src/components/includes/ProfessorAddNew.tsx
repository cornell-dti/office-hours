import React, { useState } from 'react';
import { Icon, DropdownItemProps } from 'semantic-ui-react';
import ProfessorOHInfo from './ProfessorOHInfo';
import ProfessorTagInfo from './ProfessorTagInfo';
import 'react-datepicker/dist/react-datepicker.css';

const ProfessorAddNew = (props: {
    courseId: string;
    taOptions?: DropdownItemProps[];
}) => {
    const [editVisible, setEditVisible] = useState(false);

    const text = props.taOptions ? 'Add New Office Hour' : 'Add New Assignment';
    return (
        <div className="ProfessorAddNew">
            <div className={`Add ${!editVisible ? 'Show' : 'Hide'}`}>
                <button type="button" className="NewOHButton" onClick={() => setEditVisible(true)}>
                    <Icon name="plus" />
                    {text}
                </button>
            </div>
            <div className={`ExpandedAdd ${editVisible ? 'Show' : 'Hide'}`}>
                <div className="NewOHHeader">
                    <button type="button" className="ExpandedNewOHButton" onClick={() => setEditVisible(false)}>
                        <Icon name="plus" />
                        {text}
                    </button>
                </div>
                {props.taOptions
                    ? <ProfessorOHInfo
                        courseId={props.courseId}
                        isNewOH={true}
                        taOptions={props.taOptions}
                        toggleEdit={() => setEditVisible(false)}
                        taUserIdsDefault={[]}
                    />
                    : <ProfessorTagInfo
                        isNew={true}
                        cancelCallback={() => setEditVisible(false)}
                        courseId={props.courseId}
                        // RYAN_TODO Figure out how to add tags all at once
                        childTags={[]}
                    />
                }
            </div>
        </div>
    );
};

export default ProfessorAddNew;
