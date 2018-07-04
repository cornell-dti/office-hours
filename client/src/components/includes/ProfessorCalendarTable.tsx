import * as React from 'react';
import ProfessorCalendarRow from './ProfessorCalendarRow';
import ProfessorDelete from '../includes/ProfessorDelete';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';
import { Loader } from 'semantic-ui-react';
import ProfessorOHInfoDelete from './ProfessorOHInfoDelete';

const QUERY = gql`
query FindSessionsByCourse($_courseId: Int!, $_beginTime: Datetime!, $_endTime: Datetime!) {
    apiGetSessions(_courseId: $_courseId, _beginTime: $_beginTime, _endTime: $_endTime) {
        nodes {
            sessionId
            startTime
            endTime
            building
            room
            sessionSeriesId
            sessionTasBySessionId {
                nodes {
                    userByUserId {
                        firstName
                        lastName
                    }
                }
            }
        }
    }
}
`;

const withData = graphql<Response, InputProps>(
    QUERY, {
        options: ({ _courseId, _beginTime, _endTime }) => ({
            variables: {
                _courseId: _courseId,
                _beginTime: _beginTime,
                _endTime: _endTime
            }
        })
    }
);

type InputProps = {
    _courseId: number,
    _beginTime: Date,
    _endTime: Date,
    data: {
        loading: boolean,
        apiGetSessions?: {
            nodes: [{}]
        }
    }
    taList: string[]
};

class ProfessorCalendarTable extends React.Component<ChildProps<InputProps, Response>> {
    state: {
        isExpanded: boolean[][]
        isDeleteVisible: boolean
        currentDay: number
        currentRow: number
        dayIndex: number
        rowIndex: number
    };

    constructor(props: ChildProps<InputProps, Response>) {
        super(props);
        this.toggleEdit = this.toggleEdit.bind(this);
        var isExpandedInit: boolean[][] = [];
        // var numOHPerDays: number[] = [20, 20, 20, 20, 20, 20, 20];
        // var numOHPerDays: number[] = [0, 0, 0, 0, 0, 0, 0];
        if (this.props.data.apiGetSessions) {
            this.props.data.apiGetSessions.nodes.forEach((node: SessionNode) => {
                // numOHPerDays[new Date(node.startTime).getDay()] = 10;
            })
        }
        for (var i = 0; i < 7; i++) {
            // Temporary fix: assumes no more than 20 office hours per day
            isExpandedInit.push(new Array<boolean>(20).fill(false));
            // isExpandedInit.push(new Array<boolean>(numOHPerDays[i]).fill(false));
            // Old way: isExpandedInit.push(new Array<boolean>(this.props.timeStart[i].length).fill(false))
        }
        this.state = {
            isExpanded: isExpandedInit,
            isDeleteVisible: false,
            currentDay: 0,
            currentRow: 0,
            dayIndex: 0,
            rowIndex: 0,
        };
        this.updateDeleteInfo = this.updateDeleteInfo.bind(this);
        this.updateDeleteVisible = this.updateDeleteVisible.bind(this);
    }

    toggleEdit(day: number, row: number) {
        var cDay = this.state.currentDay;
        var cRow = this.state.currentRow;

        if (!(cDay === day && cRow === row)) {
            this.state.isExpanded[cDay][cRow] = false;
        }
        this.state.isExpanded[day][row] = !this.state.isExpanded[day][row];

        this.setState({
            isExpanded: this.state.isExpanded,
            currentDay: day,
            currentRow: row
        });
    }

    updateDeleteInfo(dayIndex: number, rowIndex: number) {
        this.setState({
            dayIndex: dayIndex,
            rowIndex: rowIndex
        });
    }

    updateDeleteVisible(toggle: boolean) {
        this.setState({
            isDeleteVisible: toggle
        });
    }

    render() {
        const { loading } = this.props.data;

        var timeStart: Date[][] = [];
        var timeEnd: Date[][] = [];
        var taIndex: Array<string[][]> = [];
        var building: string[][] = [];
        var room: string[][] = [];
        var isSeries: boolean[][] = [];

        for (var day = 0; day < 7; day++) {
            timeStart.push(new Array<Date>());
            timeEnd.push(new Array<Date>());
            taIndex.push(new Array<string[]>());
            building.push(new Array<string>());
            room.push(new Array<string>());
            isSeries.push(new Array<boolean>());
        }

        if (this.props.data.apiGetSessions) {
            this.props.data.apiGetSessions.nodes.forEach((node: SessionNode) => {
                // 0 = Monday..., 5 = Saturday, 6 = Sunday
                var dayIndex = (new Date(node.startTime).getDay() + 5) % 6;
                timeStart[dayIndex].push(new Date(node.startTime));
                timeEnd[dayIndex].push(new Date(node.endTime));

                var tas: string[] = [];
                node.sessionTasBySessionId.nodes.forEach((ta) => {
                    tas.push(ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName);
                });
                building[dayIndex].push(node.building);
                room[dayIndex].push(node.room);
                taIndex[dayIndex].push(tas);
                isSeries[dayIndex].push(node.sessionSeriesId !== null);
            });
        }

        var tablewidth = 5;
        var dayIndex = this.state.dayIndex;
        var rowIndex = this.state.rowIndex;

        var days = ['Monday', 'Tuesday', 'Wednesday', 'Thurdsay', 'Friday', 'Saturday', 'Sunday'];
        var headers = new Array(7);

        for (var i = 0; i < headers.length; i++) {
            headers[i] = (
                <tr>
                    <th colSpan={tablewidth}>{days[i]}</th>
                </tr>
            );
        }

        var rows = days.map(
            (tag, i) => {
                return (
                    <tbody>
                        <tr>
                            <th colSpan={tablewidth}>{tag}</th>
                        </tr>
                        <ProfessorCalendarRow
                            taList={this.props.taList}
                            timeStart={timeStart[i]}
                            timeEnd={timeEnd[i]}
                            officeHoursTas={taIndex[i]}
                            locationBuilding={building[i]}
                            locationRoomNum={room[i]}
                            isSeries={isSeries[i]}

                            tablewidth={5}
                            dayNumber={i}
                            isExpanded={this.state.isExpanded[i]}
                            handleEditToggle={this.toggleEdit}
                            updateDeleteInfo={this.updateDeleteInfo}
                            updateDeleteVisible={this.updateDeleteVisible}
                        />
                    </tbody>
                )
            }
        );

        return (
            <div className="ProfessorCalendarTable">
                <ProfessorDelete
                    isDeleteVisible={this.state.isDeleteVisible}
                    updateDeleteVisible={this.updateDeleteVisible}
                    content={
                        <ProfessorOHInfoDelete
                            ta={taIndex[dayIndex][rowIndex]}
                            timeStart={timeStart[dayIndex][rowIndex]}
                            timeEnd={timeEnd[dayIndex][rowIndex]}
                            locationBuilding={building[dayIndex][rowIndex]}
                            locationRoomNum={room[dayIndex][rowIndex]}
                            isSeries={isSeries[dayIndex][rowIndex]}
                        />
                    }
                />
                <table className="Calendar">
                    {this.state.isExpanded[0]}
                    {loading && <Loader active={true} content={'Loading'} />}
                    {!loading && rows}
                </table>
            </div>
        );
    }
}

export default withData(ProfessorCalendarTable);
