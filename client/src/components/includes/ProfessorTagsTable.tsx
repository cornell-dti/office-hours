import * as React from 'react';
import ProfessorTagsRow from './ProfessorTagsRow';

import { firestore } from '../../firebase';
import { useQuery } from '../../firehooks';

const ProfessorTagsTable = (props: { courseId: string }) => {

    const getQuery = () => firestore
        .collection('tags')
        .where('courseId', '==', firestore.doc('courses/' + props.courseId));

    const [tags, setQuery] = useQuery<FireTag>(getQuery(), 'tagId');
    // Update query when course id prop changes
    React.useEffect(() => setQuery(getQuery()), [props.courseId]);

    return (
        <React.Fragment>
            <div className="Spacing" />
            <div className="ProfessorTagsTable">
                <table className="Tags">
                    <tbody>
                        <tr>
                            <th>Assignment</th>
                            <th>Tags</th>
                            <th id="statusColumn">Status</th>
                            <th>Edit</th>
                        </tr>
                    </tbody>
                    {tags
                        .filter(tag => tag.level === 1)
                        .map((tag, i) =>
                            <ProfessorTagsRow
                                tag={tag}
                                key={tag.tagId}
                                index={i}
                                childTags={tags.filter(t => t.parentTag && t.parentTag.id === tag.tagId)}
                                courseId={props.courseId}
                            />
                        )}
                </table>
            </div>
        </React.Fragment>
    );
};

export default ProfessorTagsTable;
