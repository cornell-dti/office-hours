import * as React from 'react';
import ProfessorTagsRow from './ProfessorTagsRow';
import ProfessorDelete from '../includes/ProfessorDelete';
import ProfessorTagsDelete from './ProfessorTagsDelete';

class ProfessorTagsTable extends React.Component {
    props: {
        assignmentName: string[]
        dateAssigned: number[]
        dateDue: number[]
        numQuestions: number[]
    }

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
            isExpanded: new Array<boolean>(this.props.assignmentName.length).fill(false),
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
                            dateAssigned={this.props.dateAssigned[rowIndex]}
                            dateDue={this.props.dateDue[rowIndex]}
                            numQuestions={this.props.numQuestions[rowIndex]}
                        />
                    }
                />
                <table className="Tags">
                    <thead className="Header">
                        <tr>
                            <th>Title</th>
                            <th>Assigned</th>
                            <th className="Due" colSpan={3}>Due</th>
                        </tr>
                    </thead>
                    <ProfessorTagsRow
                        numRows={this.props.assignmentName.length}
                        assignmentName={this.props.assignmentName}
                        dateAssigned={this.props.dateAssigned}
                        dateDue={this.props.dateDue}
                        numQuestions={this.props.numQuestions}

                        tableWidth={5}
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
