import * as React from 'react';
import * as moment from 'moment';
import { Icon, DropdownItemProps } from 'semantic-ui-react';
import 'react-datepicker/dist/react-datepicker.css';
import ProfessorOHInfo from './ProfessorOHInfo';

class ProfessorCalendarRow extends React.Component {

    props: {
        courseId: number,
        dayNumber: number,
        taOptions: DropdownItemProps[],
        timeStart: Date[],
        timeEnd: Date[],
        taNames: string[][],
        taUserIds: number[][],
        locationBuilding: string[],
        locationRoomNum: string[],
        sessionId: number[],
        sessionSeriesId: number[],
        isExpanded: boolean[],
        handleEditToggle: Function,
        tablewidth: number,
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
        if (this.props.timeStart.length === 0) {
            return (
                <tbody>
                    <tr>
                        <td colSpan={this.props.tablewidth} className="NoOH">
                            <i>No office hours scheduled</i>
                        </td>
                    </tr>
                </tbody>
            );
        }

        var timeStart = new Array<moment.Moment>(this.props.timeStart.length);
        var timeEnd = new Array<moment.Moment>(this.props.timeEnd.length);
        for (var index = 0; index < this.props.timeStart.length; index++) {
            timeStart[index] = moment(this.props.timeStart[index]);
            timeEnd[index] = moment(this.props.timeEnd[index]);
        }

        var rowPair = this.props.timeStart.map(
            (row, i) => {
                return (
                    <tbody
                        className={'Pair ' + this.props.isExpanded[i] + ' ' + (i % 2 === 0 ? 'odd' : 'even')}
                        key={this.props.sessionId[i]}
                    >
                        <tr className="Preview">
                            <td>{timeStart[i].format('h:mm A')} to {timeEnd[i].format('h:mm A')}</td>
                            <td>{this.props.taNames[i].join(', ')}</td>
                            <td>{this.props.locationBuilding[i]} {this.props.locationRoomNum[i]}</td>
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
                                colSpan={this.props.tablewidth}
                                className={'ExpandedEdit ' + this.props.isExpanded[i]}
                            >
                                <ProfessorOHInfo
                                    courseId={this.props.courseId}
                                    isNewOH={false}
                                    taOptions={this.props.taOptions}
                                    taUserIdsDefault={this.props.taUserIds[i]}
                                    locationBuildingDefault={this.props.locationBuilding[i]}
                                    locationRoomNumDefault={this.props.locationRoomNum[i]}
                                    startTimeDefault={timeStart[i]}
                                    endTimeDefault={timeEnd[i]}
                                    sessionId={this.props.sessionId[i]}
                                    sessionSeriesId={this.props.sessionSeriesId[i]}
                                    toggleEdit={() => this.toggleEdit(i)}
                                    refreshCallback={this.props.refreshCallback}
                                    key={this.props.sessionId[i]}
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
