import React, { useState } from 'react';
import { Icon } from 'semantic-ui-react';
import 'react-datepicker/dist/react-datepicker.css';
import ProfessorTagInfo from './ProfessorTagInfo';

const ProfessorTagsRow = (props: {
    tag: FireTag;
    index: number;
    childTags: FireTag[];
    courseId: string;
}) => {
    const [showEdit, setShowEdit] = useState(false);
    return (
        <tbody className={'Pair ' + showEdit + ' ' + (props.index % 2 === 0 ? 'odd' : 'even')} key={props.tag.tagId}>
            <tr className="Preview">
                <td>
                    <span className={'AssignmentTag'} key={props.tag.tagId}>
                        {props.tag.name}
                    </span>
                </td>
                <td>
                    {props.childTags.map((childTag, index) =>
                        <span key={childTag.tagId}>
                            {index !== 0 && <span className="ChildTagSeparator">&#9679;</span>}
                            <span className={'ChildTag'}>
                                {childTag.name}
                            </span>
                        </span>
                    )
                    }
                </td>
                <td>{props.tag.active ? 'Active' : 'Inactive'}</td>
                <td>
                    <button type="button" className="Edit" onClick={() => setShowEdit(!showEdit)}>
                        <Icon name="pencil" />
                    </button>
                </td>
            </tr>
            <tr>
                <td className={'ExpandedEdit ' + showEdit} colSpan={4}>
                    <ProfessorTagInfo
                        isNew={false}
                        cancelCallback={() => setShowEdit(!showEdit)}
                        tag={props.tag}
                        courseId={props.courseId}
                        childTags={props.childTags}
                    />
                </td>
            </tr>
        </tbody>
    );
};

export default ProfessorTagsRow;
