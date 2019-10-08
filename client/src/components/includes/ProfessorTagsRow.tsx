import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import 'react-datepicker/dist/react-datepicker.css';
import ProfessorTagInfo from './ProfessorTagInfo';
import { firestore } from 'src/firebase';
import { useQuery } from 'src/firehooks';

const ProfessorTagsRow = (props: {
    isExpanded: boolean[],
    handleEditToggle: Function,
    courseId: string,
}) => {
    const toggleEdit = (row: number) => {
        props.handleEditToggle(row);
    };

    const getQuery = () => firestore
        .collection('tags')
        .where('courseId', '==', firestore.doc('courses/' + props.courseId));

    const [tags, setQuery] = useQuery<FireTag>(getQuery(), 'tagId');
    // Update query when course id prop changes
    React.useEffect(() => setQuery(getQuery()), [props.courseId]);

    console.log(tags);
    return (
        <>{tags.filter(tag => tag.level === 1).map((row, i) => (
            <tbody className={'Pair ' + props.isExpanded[i] + ' ' + (i % 2 === 0 ? 'odd' : 'even')} key={row.tagId}>
                <tr className="Preview">
                    <td>
                        <span className={'AssignmentTag'} key={row.tagId}>
                            {row.name}
                        </span>
                    </td>
                    <td>
                        {tags
                            .filter(childTag => (childTag.parentTag && childTag.parentTag.id) === row.tagId)
                            .map((childTag, index) =>
                                <span key={childTag.tagId}>
                                    {index !== 0 && <span className="ChildTagSeparator">&#9679;</span>}
                                    <span className={'ChildTag'}>
                                        {childTag.name}
                                    </span>
                                </span>
                            )
                        }
                    </td>
                    <td>{row.active ? 'Active' : 'Inactive'}</td>
                    <td>
                        <button className="Edit" onClick={() => toggleEdit(i)}>
                            <Icon name="pencil" />
                        </button>
                    </td>
                </tr>
                <tr>
                    <td className={'ExpandedEdit ' + props.isExpanded[i]} colSpan={4}>
                        <ProfessorTagInfo
                            isNew={false}
                            cancelCallback={() => toggleEdit(i)}
                            tag={row}
                            courseId={props.courseId}
                        />
                    </td>
                </tr>
            </tbody>
        ))} </>
    );
};
export default ProfessorTagsRow;
