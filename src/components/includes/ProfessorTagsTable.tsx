import * as React from 'react';
import ProfessorTagsRow from './ProfessorTagsRow';

import { firestore } from '../../firebase';
import { useQuery } from '../../firehooks';

const getQuery = (courseId: string) => firestore
    .collection('tags')
    .where('courseId', '==', courseId);

const ProfessorTagsTable = (props: { courseId: string }) => {
    const tags = useQuery<FireTag>(props.courseId, getQuery, 'tagId');

    return (
        <>
            <div className="Spacing" />
            <div className="ProfessorTagsTable">
                <table className="Tags">
                    <tbody>
                        <tr>
                            <th>Assignment</th>
                            <th>Tags</th>
                            <th id="statusColumn">Status</th>
                            <th>Actions</th>
                        </tr>
                    </tbody>
                    {tags
                        .filter(tag => tag.level === 1)
                        .map((tag, i) =>
                            <ProfessorTagsRow
                                tag={tag}
                                key={tag.tagId}
                                index={i}
                                childTags={tags.filter(t => t.parentTag && t.parentTag === tag.tagId)}
                                courseId={props.courseId}
                            />
                        )}
                </table>
            </div>
        </>
    );
};

export default ProfessorTagsTable;
