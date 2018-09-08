import * as React from 'react';
import * as moment from 'moment';
import { Icon, DropdownItemProps } from 'semantic-ui-react';
import 'react-datepicker/dist/react-datepicker.css';
import ProfessorOHInfo from './ProfessorOHInfo';

class ProfessorCalendarRow extends React.Component {

    props: {
        dayNumber: number,
        sessions: AppSession[],
        courseId: number,
        taOptions: DropdownItemProps[],
        isExpanded: boolean[],
        handleEditToggle: Function,
        updateDeleteInfo: Function,
        updateDeleteVisible: Function,
        refreshCallback: Function
    };

    constructor(props: {}) {
        super(props);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.updateDeleteInfo = this.updateDeleteInfo.bind(this);
    }

    toggleEdit(row: number) {
        this.props.handleEditToggle(this.props.dayNumber, row);
    }

    updateDeleteInfo(dayIndex: number, rowIndex: number) {
        this.props.updateDeleteInfo(dayIndex, rowIndex);
        this.props.updateDeleteVisible(true);
    }

    render() {
        if (this.props.sessions.length === 0) {
            return (
                <tbody>
                    <tr>
                        <td colSpan={5} className="NoOH">
                            <i>No office hours scheduled</i>
                        </td>
                    </tr>
                </tbody>
            );
        }

        var startTime = new Array<moment.Moment>(this.props.sessions.length);
        var endTime = new Array<moment.Moment>(this.props.sessions.length);
        for (var index = 0; index < this.props.sessions.length; index++) {
            startTime[index] = moment(this.props.sessions[index].startTime);
            endTime[index] = moment(this.props.sessions[index].endTime);
        }

        var rowPair = this.props.sessions.map(
            (row, i) => {
                return (
                    <tbody
                        className={'Pair ' + this.props.isExpanded[i] + ' ' + (i % 2 === 0 ? 'odd' : 'even')}
                        key={this.props.sessions[i].sessionId}
                    >
                        <tr className="Preview">
                            <td>{startTime[i].format('h:mm A')} to {endTime[i].format('h:mm A')}</td>
                            <td>{this.props.sessions[i].sessionTasBySessionId.nodes
                                .map(ta => ta.userByUserId.computedName).join(', ')}</td>
                            <td>{this.props.sessions[i].building} {this.props.sessions[i].room}</td>
                            <td>
                                <button
                                    className="Edit"
                                    onClick={() => this.toggleEdit(i)}
                                >
                                    <Icon name="pencil" />
                                </button>
                            </td>
                            <td>
                                <button
                                    className="Delete"
                                    onClick={() => this.updateDeleteInfo(this.props.dayNumber, i)}
                                >
                                    <Icon name="x" />
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td
                                colSpan={5}
                                className={'ExpandedEdit ' + this.props.isExpanded[i]}
                            >
                                <ProfessorOHInfo
                                    key={this.props.sessions[i].sessionId}
                                    session={this.props.sessions[i]}
                                    courseId={this.props.courseId}
                                    isNewOH={false}
                                    taOptions={this.props.taOptions}
                                    toggleEdit={() => this.toggleEdit(i)}
                                    refreshCallback={this.props.refreshCallback}
                                />
                                <button
                                    className="Bottom Delete"
                                    onClick={() => this.updateDeleteInfo(this.props.dayNumber, i)}
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

export default ProfessorCalendarRow;
