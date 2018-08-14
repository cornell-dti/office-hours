import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import 'react-datepicker/dist/react-datepicker.css';
import ProfessorTagInfo from './ProfessorTagInfo';

class ProfessorTagsRow extends React.Component {

    props: {
        tags: AppTag[]
        isExpanded: boolean[]
        handleEditToggle: Function
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
                return (
                    <tbody
                        className={'Pair ' + this.props.isExpanded[i] + ' ' + (i % 2 === 0 ? 'odd' : 'even')}
                        key={row.tagId}
                    >
                        <tr className="Preview">
                            <td>
                                <span
                                    className={'ChildTag tag primaryTag ' +
                                        (this.props.isExpanded[i] ? 'selectedTag' : '')}
                                    key={row.tagId}
                                >
                                    {row.name}
                                </span>
                            </td>
                            <td>
                                {row.tagRelationsByParentId &&
                                    row.tagRelationsByParentId.nodes.map((childTag) =>
                                        <span
                                            className={'ChildTag tag secondaryTag ' +
                                                (this.props.isExpanded[i] ? 'selectedTag' : '')}
                                            key={childTag.tagByChildId.tagId}
                                        >
                                            {childTag.tagByChildId.name}
                                        </span>)}
                            </td>
                            <td>{row.activated ? 'Active' : 'Inactive'}</td>
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
