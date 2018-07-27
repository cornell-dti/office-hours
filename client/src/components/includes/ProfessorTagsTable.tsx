import * as React from 'react';
import ProfessorTagsRow from './ProfessorTagsRow';
import ProfessorDelete from '../includes/ProfessorDelete';
import ProfessorTagsDelete from './ProfessorTagsDelete';

class ProfessorTagsTable extends React.Component {
    props: {
        assignmentName: string[]
        isActivated: boolean[]
        numQuestions: number[]
        numRows: number
    };

    state: {
        isExpanded: boolean[]
        isDeleteVisible: boolean
        currentRow: number
        rowIndex: number
    };

    constructor(props: {}) {
        super(props);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.state = {
            // Temporary Number
            isExpanded: new Array<boolean>(100).fill(false),
            isDeleteVisible: false,
            currentRow: 0,
            rowIndex: 0
        };
        this.updateDeleteInfo = this.updateDeleteInfo.bind(this);
        this.updateDeleteVisible = this.updateDeleteVisible.bind(this);
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

    updateDeleteInfo(rowIndex: number) {
        this.setState({
            rowIndex: rowIndex
        });
    }

    updateDeleteVisible(toggle: boolean) {
        this.setState({
            isDeleteVisible: toggle
        });
    }

    render() {
        var rowIndex = this.state.rowIndex;
        return (
            <div className="ProfessorTagsTable">
                <ProfessorDelete
                    isDeleteVisible={this.state.isDeleteVisible}
                    updateDeleteVisible={this.updateDeleteVisible}
                    content={
                        <ProfessorTagsDelete
                            assignmentName={this.props.assignmentName[rowIndex]}
                            isActivated={this.props.isActivated[rowIndex]}
                            numQuestions={this.props.numQuestions[rowIndex]}
                        />
                    }
                />
                <table className="Tags">
                    <tr>
                        <th>Title</th>
                        <th>Activated?</th>
                        <th colSpan={3}>Questions</th>
                    </tr>
                    <ProfessorTagsRow
                        numRows={this.props.assignmentName.length}
                        assignmentName={this.props.assignmentName}
                        isActivated={this.props.isActivated}
                        numQuestions={this.props.numQuestions}

                        tableWidth={6}
                        isExpanded={this.state.isExpanded}
                        handleEditToggle={this.toggleEdit}
                        updateDeleteInfo={this.updateDeleteInfo}
                        updateDeleteVisible={this.updateDeleteVisible}
                    />
                </table>
            </div>
        );
    }
}

export default ProfessorTagsTable;
