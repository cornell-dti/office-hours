import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import 'react-datepicker/dist/react-datepicker.css';
import ProfessorTagInfo from './ProfessorTagInfo';

class ProfessorTagsRow extends React.Component {

    props: {
        tags: FireTag[]
        isExpanded: boolean[]
        handleEditToggle: Function
        courseId: string
    };

    constructor(props: {}) {
        super(props);
        this.toggleEdit = this.toggleEdit.bind(this);
    }

    toggleEdit(row: number) {
        this.props.handleEditToggle(row);
    }

    render() {
        var rowPair = this.props.tags.map(
            (row, i) => {
                let childTags: { tagByChildId: AppTag }[] | undefined = [];
                // RYAN_TOOD
                // childTags = row.tagRelationsByParentId &&
                //     row.tagRelationsByParentId.nodes.filter((childTag) => childTag.tagByChildId.activated);
                return (
                    <tbody
                        className={'Pair ' + this.props.isExpanded[i] + ' ' + (i % 2 === 0 ? 'odd' : 'even')}
                        key={row.tagId}
                    >
                        <tr className="Preview">
                            <td>
                                <span
                                    className={'AssignmentTag'}
                                    key={row.tagId}
                                >
                                    {row.name}
                                </span>
                            </td>
                            <td>
                                {childTags && childTags.map((childTag, index) =>
                                    <span key={childTag.tagByChildId.tagId}>
                                        <span
                                            className={'ChildTag'}
                                        >
                                            {childTag.tagByChildId.name}
                                        </span>
                                        {
                                            index !== (childTags && childTags.length - 1) &&
                                            <span className="ChildTagSeparator">&#9679;</span>
                                        }
                                    </span>
                                )}
                            </td>
                            <td>{row.active ? 'Active' : 'Inactive'}</td>
                            <td>
                                <button className="Edit" onClick={() => this.toggleEdit(i)}>
                                    <Icon name="pencil" />
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td
                                className={'ExpandedEdit ' + this.props.isExpanded[i]}
                                colSpan={4}
                            >
                                <ProfessorTagInfo
                                    isNew={false}
                                    cancelCallback={() => this.toggleEdit(i)}
                                    tag={row}
                                    courseId={this.props.courseId}
                                />
                            </td>
                        </tr>
                    </tbody >
                );
            }
        );

        return (
            rowPair
        );
    }
}

export default ProfessorTagsRow;
