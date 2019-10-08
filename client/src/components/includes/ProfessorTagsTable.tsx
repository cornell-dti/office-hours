import * as React from 'react';
import ProfessorTagsRow from './ProfessorTagsRow';
class ProfessorTagsTable extends React.Component {
    props: {
        tags: FireTag[]
        courseId: string
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

    componentWillReceiveProps(nextProps: { tags: AppTag[] }) {
        this.setState({
            isExpanded: new Array<boolean>(nextProps.tags.length).fill(false)
        });
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
                                <th id="statusColumn">Status</th>
                                <th>Edit</th>
                            </tr>
                        </tbody>
                        <ProfessorTagsRow
                            tags={this.props.tags}
                            isExpanded={this.state.isExpanded}
                            handleEditToggle={this.toggleEdit}
                            courseId={this.props.courseId}
                        />
                    </table>
                </div>
            </React.Fragment>
        );
    }
}

export default ProfessorTagsTable;
