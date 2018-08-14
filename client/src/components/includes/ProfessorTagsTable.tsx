import * as React from 'react';
import ProfessorTagsRow from './ProfessorTagsRow';
class ProfessorTagsTable extends React.Component {
    props: {
        tags: AppTag[]
    };

    state: {
        isExpanded: boolean[]
        currentRow: number
        rowIndex: number
    };

    constructor(props: {}) {
        super(props);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.state = {
            isExpanded: new Array<boolean>(this.props.tags.length).fill(false),
            currentRow: 0,
            rowIndex: 0
        };
    }

    toggleEdit(row: number) {
        var cRow = this.state.currentRow;
        if (cRow !== row) {
            this.state.isExpanded[cRow] = false;
        }
        this.state.isExpanded[row] = !this.state.isExpanded[row];
        this.setState({
            isExpanded: this.state.isExpanded,
            currentRow: row
        });
    }

    render() {
        return (
            <React.Fragment>
                <div className="Spacing" />
                <div className="ProfessorTagsTable">
                    <table className="Tags">
                        <tbody>
                            <tr>
                                <th>Assignment</th>
                                <th>Tags</th>
                                <th colSpan={2}>Status</th>
                            </tr>
                        </tbody>
                        <ProfessorTagsRow
                            tags={this.props.tags}
                            isExpanded={this.state.isExpanded}
                            handleEditToggle={this.toggleEdit}
                        />
                    </table>
                </div>
            </React.Fragment>
        );
    }
}

export default ProfessorTagsTable;
