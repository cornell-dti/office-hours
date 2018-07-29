import * as React from 'react';
import { Icon, Checkbox } from 'semantic-ui-react';
import 'react-datepicker/dist/react-datepicker.css';
import ProfessorTagInfo from './ProfessorTagInfo';

class ProfessorTagsRow extends React.Component {

    props: {
        numRows: number
        assignmentName: string[]
        isActivated: boolean[]
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

        var rowPair = this.props.assignmentName.map(
            (row, i) => {
                return (
                    <tbody className={'Pair ' + this.props.isExpanded[i]} key={i}>
                        <tr className="Preview">
                            <td>{this.props.assignmentName[i]}</td>
                            <td>
                                <Checkbox
                                    checked={this.props.isActivated[i]}
                                    readOnly={true}
                                />
                            </td>
                            <td>{('0' + this.props.numQuestions[i]).slice(-2)}</td>
                            <td>
                                <button className="Edit" onClick={() => this.toggleEdit(i)}>
                                    <Icon name="pencil" />
                                </button>
                            </td>
                            <td>
                                <button
                                    className="Delete"
                                    onClick={() => this.updateDeleteInfo(i)}
                                >
                                    <Icon name="x" />
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td
                                colSpan={this.props.tableWidth}
                                className={'ExpandedEdit ' + this.props.isExpanded[i]}
                            >
                                <ProfessorTagInfo
                                    isNew={false}
                                    assignmentName={this.props.assignmentName[i]}
                                    isActivated={this.props.isActivated[i]}
                                    numQuestions={this.props.numQuestions[i]}
                                    toggleCancel={() => this.updateDeleteInfo(i)}
                                />
                                <button
                                    className="Bottom Delete"
                                    onClick={() => this.updateDeleteInfo(i)}
                                >
                                    Delete
                                </button>
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
