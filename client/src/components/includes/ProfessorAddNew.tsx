import React, { useState } from 'react';
import { Icon, DropdownItemProps } from 'semantic-ui-react';
import ProfessorOHInfo from './ProfessorOHInfo';
import ProfessorTagInfo from './ProfessorTagInfo';
import 'react-datepicker/dist/react-datepicker.css';

const ProfessorAddNew = (
    props: {
        courseId: string;
        refreshCallback: Function;
        taOptions?: DropdownItemProps[];
    },
) => {
    const [editVisible, setEditVisible] = useState(false);

    const text = props.taOptions ? 'Add New Office Hour' : 'Add New Assignment';

    return (
        <div className="ProfessorAddNew">
            <div className={`Add ${!editVisible}`}>
                <button className="NewOHButton" type="button" onClick={() => setEditVisible(true)}>
                    <Icon name="plus" />
                    {text}
                </button>
            </div>
            <div className={`ExpandedAdd ${editVisible}`}>
                <div className="NewOHHeader">
                    <button className="ExpandedNewOHButton" type="submit" onClick={() => setEditVisible(false)}>
                        <Icon name="plus" />
                        {text}
                    </button>
                </div>
                {props.taOptions
                    ? <ProfessorOHInfo
                        courseId={props.courseId}
                        isNewOH
                        taOptions={props.taOptions}
                        toggleEdit={() => setEditVisible(false)}
                        taUserIdsDefault={[]}
                        refreshCallback={props.refreshCallback}
                    /> : (
                        <ProfessorTagInfo
                            isNew
                            cancelCallback={() => setEditVisible(false)}
                            refreshCallback={props.refreshCallback}
                            courseId={props.courseId}
                        />
                    )
                }
            </div>
        </div>
    );
};

export default ProfessorAddNew;
