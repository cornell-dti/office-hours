import * as React from 'react';
import ProfessorTagsRow from './ProfessorTagsRow';

import { getTagsQuery, useQuery } from '../../firehooks';

const ProfessorTagsTable = (props: { courseId: string }) => {
    const tags = useQuery<FireTag>(props.courseId, getTagsQuery, 'tagId');

    return (
        <>
            <div className='Spacing' />
            <div className='ProfessorTagsTable'>
                <table className='Tags'>
                    <tbody>
                        <tr>
                            <th>Category</th>
                            <th>Subtags</th>
                            <th id='statusColumn'>Status</th>
                            <th>Edit</th>
                        </tr>
                    </tbody>
                    {tags
                        .filter((tag) => tag.level === 1)
                        .sort((a, b) => (a.name < b.name ? 1 : -1))
                        .map((tag, i) => (
                            <ProfessorTagsRow
                                tag={tag}
                                key={tag.tagId}
                                index={i}
                                childTags={tags.filter(
                                    (t) =>
                                        t.parentTag && t.parentTag === tag.tagId
                                )}
                                courseId={props.courseId}
                            />
                        ))}
                </table>
            </div>
        </>
    );
};

export default ProfessorTagsTable;
