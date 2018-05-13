import * as React from 'react';
import * as moment from 'moment';
import { Icon } from 'semantic-ui-react';
import 'react-datepicker/dist/react-datepicker.css';
import ProfoessorTagInfo from './ProfessorTagInfo';

class ProfessorTagsRow extends React.Component {

    props: {
        numRows: number
        assignmentName: string[]
        dateAssigned: number[]
        dateDue: number[]
        numQuestions: number[]

        tableWidth: number
        isExpanded: boolean[]
        handleEditToggle: Function
        updateDeleteInfo: Function
        updateDeleteVisible: Function
    };

    constructor(props: {}) {
        super(props);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.updateDeleteInfo = this.updateDeleteInfo.bind(this);
    }

    toggleEdit(row: number) {
        this.props.handleEditToggle(row);
    }

    updateDeleteInfo(rowIndex: number) {
        this.props.updateDeleteInfo(rowIndex);
        this.props.updateDeleteVisible(true);
    }

    render() {
        if (this.props.numRows === 0) {
            return (
                <tr>
                    <td colSpan={this.props.numRows} className="None">
                        <i>No tags for this course</i>
                    </td>
                </tr>
            );
        }

        // Convert UNIX timestamps to readable time string
        var timeStart = new Array<moment.Moment>(this.props.dateAssigned.length);
        var timeEnd = new Array<moment.Moment>(this.props.dateDue.length);
        for (var index = 0; index < this.props.numRows; index++) {
            timeStart[index] = moment(this.props.dateAssigned[index]);
            timeEnd[index] = moment(this.props.dateDue[index]);
        }

        var rowPair = this.props.assignmentName.map(
            (row, index) => {
                return (
                    <tbody className={'Pair ' + this.props.isExpanded[index]}>
                        <tr className="Preview">
                            <td>{this.props.assignmentName[index]}</td>
                            <td>{timeStart[index].format('MM/DD/YYYY')}</td>
                            <td>{timeEnd[index].format('MM/DD/YYYY')}</td>
                            <td>
                                <button className="Edit" onClick={() => this.toggleEdit(index)}>
                                    <Icon name="pencil" />
                                </button>
                            </td>
                            <td>
                                <button className="Delete" onClick={() =>
                                    this.updateDeleteInfo(index)}>
                                    <Icon name="x" />
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={this.props.tableWidth}
                                className={'ExpandedEdit ' + this.props.isExpanded[index]}>
                                <ProfoessorTagInfo
                                    assignmentName={this.props.assignmentName[index]}
                                    startTimeDefault={timeStart[index]}
                                    endTimeDefault={timeEnd[index]}
                                    numQuestions={this.props.numQuestions[index]}
                                />
                                <div className="EditButtons">
                                    <button className="Delete" onClick={() =>
                                        this.updateDeleteInfo(index)}>
                                        Delete
                                    </button>
                                    <button className="Cancel" onClick={() => this.toggleEdit(index)}>
                                        Cancel
                                    </button>
                                    <button className="SaveChanges">
                                        Save Changes
                                    </button>
                                </div>
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
