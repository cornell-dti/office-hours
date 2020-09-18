import React, { useState, useCallback } from 'react';
import { Icon } from 'semantic-ui-react';

import { firestore } from '../../firebase';
import { removeAssignment } from '../../functions/tags';
import { useConfirm } from './Confirmation';

import ProfessorTagInfo from './ProfessorTagInfo';

import 'react-datepicker/dist/react-datepicker.css';


const ProfessorTagsRow = (props: {
    tag: FireTag;
    index: number;
    childTags: FireTag[];
    courseId: string;
}) => {
    const [showEdit, setShowEdit] = useState(false);

    const {tag, childTags} = props;

    const remove = useCallback((): Promise<void> => removeAssignment(firestore, tag, childTags), [tag, childTags]);

    const {confirm} = useConfirm();

    const confirmDelete = useCallback(() => {
        // eslint-disable-next-line no-console
        console.log("confirming...", confirm);
        // TODO(ewlsh): Use a good dialog library.
        // eslint-disable-next-line no-restricted-globals, no-alert
        confirm({
            content: `Are you sure you want to delete the ${tag.name} tag?`
        }).then(() => {
            // eslint-disable-next-line no-console
            console.log('removing...');
            return remove();
        })
        // eslint-disable-next-line no-console
            .then(() => console.log("Assignment successfully deleted."))
        // eslint-disable-next-line no-console
            .catch(err => console.error(err));
        
    }, [tag, confirm, remove]);

    return (
        <tbody className={`Pair ${showEdit ? 'Open' : 'Closed'} ${props.index % 2 === 0 ? 'odd' : 'even'}`} key={props.tag.tagId}>
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
                    <button type="button" className="Edit" onClick={() => setShowEdit(true)}>
                        <Icon name="pencil" />
                    </button>
                    <button type="button" className="Delete" onClick={() => confirmDelete()}>
                        <Icon name="trash" />
                    </button>
                </td>
            </tr>
            <tr>
                <td className={`ExpandedEdit ${showEdit ? 'Open' : 'Closed'}`} colSpan={4}>
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
