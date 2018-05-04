import * as React from 'react';
import ProfessorCalendarRow from './ProfessorCalendarRow';
import ProfessorDelete from '../includes/ProfessorDelete';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

const QUERY = gql`
query FindSessionsByCourse($courseId: Int!, $beginTime: Datetime!, $endTime: Datetime!) {
    searchSessionRange(course: $courseId, begintime: $beginTime, endtime: $endTime) {
        nodes {
            sessionSeryBySessionSeriesId {
                sessionSeriesId
                startTime
                endTime
                building
                room
                sessionSeriesTasBySessionSeriesId {
                    nodes {
                        userByUserId {
                            firstName
                            lastName
                        }
                    }
                }
            }
            sessionId
            startTime
            endTime
            building
            room
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

const withData = graphql<Response, InputProps>(QUERY, {
    options: ({ courseId, beginTime, endTime }) => ({
        variables: {
            courseId: courseId,
            beginTime: beginTime,
            endTime: endTime
        }
    })
});

type InputProps = {
    courseId: number,
    beginTime: Date,
    endTime: Date,
    data: {
        searchSessionRange?: {
            nodes: [{}]
        },
    },
    taList: string[] // Replace with query
};

class ProfessorCalendarTable extends React.Component<ChildProps<InputProps, Response>>{
    // props: {
    //     taList: string[],
    //     timeStart: number[][],
    //     timeEnd: number[][],
    //     taIndex: number[][],
    //     LocationBuilding: string[][],
    //     LocationRoomNum: string[][]
    // };

    state: {
        isExpanded: boolean[][]
        isDeleteVisible: boolean
        currentDay: number
        currentRow: number
        dayIndex: number
        rowIndex: number
    }

    constructor(props: ChildProps<InputProps, Response>) {
        super(props);
        this.toggleEdit = this.toggleEdit.bind(this);
        var isExpandedInit: boolean[][] = []
        for (var i = 0; i < 7; i++) {
            // isExpandedInit.push(new Array<boolean>(this.props.timeStart[i].length).fill(false))
            // Temporary fix: assumes no more than 20 office hours per day
            isExpandedInit.push(new Array<boolean>(20).fill(false))
        }
        this.state = {
            isExpanded: isExpandedInit,
            isDeleteVisible: false,
            currentDay: 0,
            currentRow: 0,
            dayIndex: 0,
            rowIndex: 0
        };
        this.updateDeleteInfo = this.updateDeleteInfo.bind(this);
        this.updateDeleteVisible = this.updateDeleteVisible.bind(this);
    }

    toggleEdit(day: number, row: number) {
        var cDay = this.state.currentDay;
        var cRow = this.state.currentRow;

        if (!(cDay == day && cRow == row)) {
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
        var timeStart: Date[][] = []
        var timeEnd: Date[][] = []
        var taIndex: string[][] = []
        var building: string[][] = []
        var room: string[][] = []

        for (var i = 0; i < 7; i++) {
            timeStart.push(new Array<Date>());
            timeEnd.push(new Array<Date>());
            taIndex.push(new Array<string>());
            building.push(new Array<string>());
            room.push(new Array<string>());
        }

        if (this.props.data.searchSessionRange) {
            this.props.data.searchSessionRange.nodes.forEach((node: SessionNode) => {
                var dayIndex = new Date(node.startTime).getDate();
                timeStart[dayIndex].push(new Date(node.startTime));
                timeEnd[dayIndex].push(new Date(node.endTime));

                var tas: string[] = [];
                if (node.sessionSeryBySessionSeriesId) {
                    if (node.sessionSeryBySessionSeriesId.sessionSeriesTasBySessionSeriesId.nodes && tas.length === 0) {
                        tas = node.sessionSeryBySessionSeriesId.sessionSeriesTasBySessionSeriesId.nodes.map(
                            ta => ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName
                        );
                    }
                    building[dayIndex].push(node.sessionSeryBySessionSeriesId.building);
                    room[dayIndex].push(node.sessionSeryBySessionSeriesId.room);
                }

                if (node.sessionTasBySessionId) {
                    node.sessionTasBySessionId.nodes.forEach(ta => {
                        tas.push(ta.userByUserId.firstName + ' ' + ta.userByUserId.lastName);
                    });
                }
                if (node.building !== null) {
                    building[dayIndex].push(node.building);
                }
                if (node.room !== null) {
                    room[dayIndex].push(node.room);
                }

                taIndex[dayIndex].push(tas[0]);
            });
        }

        var tablewidth = 5;
        var dayIndex = this.state.dayIndex;
        var rowIndex = this.state.rowIndex;

        var rows = new Array(7);
        for (var i = 0; i < rows.length; i++) {
            rows[i] =
                <ProfessorCalendarRow
                    dayNumber={i}
                    taList={this.props.taList}
                    timeStart={timeStart[i]}
                    timeEnd={timeEnd[i]}
                    taIndex={taIndex[i]}
                    locationBuilding={building[i]}
                    locationRoomNum={room[i]}
                    isExpanded={this.state.isExpanded[i]}
                    handleEditToggle={this.toggleEdit}
                    tablewidth={5}
                    updateDeleteInfo={this.updateDeleteInfo}
                    updateDeleteVisible={this.updateDeleteVisible}
                />
        }

        return (
            <div className="ProfessorCalendarTable">
                <ProfessorDelete
                    isDeleteVisible={this.state.isDeleteVisible}
                    updateDeleteVisible={this.updateDeleteVisible}
                    ta={taIndex[dayIndex][rowIndex]}
                    timeStart={timeStart[dayIndex][rowIndex]}
                    timeEnd={timeEnd[dayIndex][rowIndex]}
                    locationBuilding={building[dayIndex][rowIndex]}
                    locationRoomNum={room[dayIndex][rowIndex]}
                />
                <table className="Calendar">
                    <tr>
                        <th colSpan={tablewidth}>Monday</th>
                    </tr>
                    {rows[0]}
                    <tr>
                        <th colSpan={tablewidth}>Tuesday</th>
                    </tr>
                    {rows[1]}
                    <tr>
                        <th colSpan={tablewidth}>Wednesday</th>
                    </tr>
                    {rows[2]}
                    <tr>
                        <th colSpan={tablewidth}>Thursday</th>
                    </tr>
                    {rows[3]}
                    <tr>
                        <th colSpan={tablewidth}>Friday</th>
                    </tr>
                    {rows[4]}
                    <tr>
                        <th colSpan={tablewidth}>Saturday</th>
                    </tr>
                    {rows[5]}
                    <tr>
                        <th colSpan={tablewidth}>Sunday</th>
                    </tr>
                    {rows[6]}
                </table>
            </div>
        );
    }
}

export default withData(ProfessorCalendarTable);
