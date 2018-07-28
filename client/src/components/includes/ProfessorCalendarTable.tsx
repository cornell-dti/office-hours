import * as React from 'react';
import ProfessorCalendarRow from './ProfessorCalendarRow';
import ProfessorDelete from './ProfessorDelete';
import ProfessorOHInfoDelete from './ProfessorOHInfoDelete';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';
import { Loader, DropdownItemProps } from 'semantic-ui-react';

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
                        computedName
                        userId
                    }
                }
            }
        }
    }
}
`;

const withData = graphql<InputProps, Response>(
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
    },
    taOptions: DropdownItemProps[]
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
        // if (this.props.data.apiGetSessions) {
        //     this.props.data.apiGetSessions.nodes.forEach((node: AppSession) => {
        //         numOHPerDays[new Date(node.startTime).getDay()] = 10;
        //     })
        // }
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
        var taNames: Array<string[][]> = [];
        var taUserIds: Array<number[][]> = [];
        var building: string[][] = [];
        var room: string[][] = [];
        var sessionId: number[][] = [];
        var sessionSeriesId: number[][] = [];

        for (var day = 0; day < 7; day++) {
            timeStart.push(new Array<Date>());
            timeEnd.push(new Array<Date>());
            taNames.push(new Array<string[]>());
            taUserIds.push(new Array<number[]>());
            building.push(new Array<string>());
            room.push(new Array<string>());
            sessionId.push(new Array<number>());
            sessionSeriesId.push(new Array<number>());
        }

        if (this.props.data.apiGetSessions) {
            this.props.data.apiGetSessions.nodes.forEach((node: AppSession) => {
                // 0 = Monday..., 5 = Saturday, 6 = Sunday
                var dayIndexQuery = (new Date(node.startTime).getDay() + 6) % 7;
                timeStart[dayIndexQuery].push(new Date(node.startTime));
                timeEnd[dayIndexQuery].push(new Date(node.endTime));

                var taNamesQuery: string[] = [];
                var taUserIdsQuery: number[] = [];
                node.sessionTasBySessionId.nodes.forEach((ta) => {
                    taNamesQuery.push(ta.userByUserId.computedName);
                    taUserIdsQuery.push(ta.userByUserId.userId);
                });
                building[dayIndexQuery].push(node.building);
                room[dayIndexQuery].push(node.room);
                taNames[dayIndexQuery].push(taNamesQuery);
                taUserIds[dayIndexQuery].push(taUserIdsQuery);
                sessionId[dayIndexQuery].push(node.sessionId);
                sessionSeriesId[dayIndexQuery].push(node.sessionSeriesId);
            });
        }

        var tablewidth = 5;
        var dayIndex = this.state.dayIndex;
        var rowIndex = this.state.rowIndex;

        var days = ['Monday', 'Tuesday', 'Wednesday', 'Thurdsay', 'Friday', 'Saturday', 'Sunday'];
        var headers = new Array(7);

        for (var index = 0; index < headers.length; index++) {
            headers[index] = (
                <tr>
                    <th colSpan={tablewidth}>{days[index]}</th>
                </tr>
            );
        }

        var rows = days.map(
            (tag, i) => {
                return (
                    <React.Fragment key={i}>
                        <tbody>
                            <tr>
                                <th colSpan={tablewidth}>{tag}</th>
                            </tr>
                        </tbody>
                        <ProfessorCalendarRow
                            key={sessionId[i].toString()}
                            courseId={this.props._courseId}
                            taOptions={this.props.taOptions}
                            timeStart={timeStart[i]}
                            timeEnd={timeEnd[i]}
                            taNames={taNames[i]}
                            taUserIds={taUserIds[i]}
                            locationBuilding={building[i]}
                            locationRoomNum={room[i]}
                            sessionId={sessionId[i]}
                            sessionSeriesId={sessionSeriesId[i]}
                            tablewidth={5}
                            dayNumber={i}
                            isExpanded={this.state.isExpanded[i]}
                            handleEditToggle={this.toggleEdit}
                            updateDeleteInfo={this.updateDeleteInfo}
                            updateDeleteVisible={this.updateDeleteVisible}
                        />
                    </React.Fragment>
                );
            }
        );

        return (
            <div className="ProfessorCalendarTable">
                <ProfessorDelete
                    isDeleteVisible={this.state.isDeleteVisible}
                    updateDeleteVisible={this.updateDeleteVisible}
                    content={
                        <ProfessorOHInfoDelete
                            ta={taNames[dayIndex][rowIndex]}
                            timeStart={timeStart[dayIndex][rowIndex]}
                            timeEnd={timeEnd[dayIndex][rowIndex]}
                            locationBuilding={building[dayIndex][rowIndex]}
                            locationRoomNum={room[dayIndex][rowIndex]}
                            sessionId={sessionId[dayIndex][rowIndex]}
                            sessionSeriesId={sessionSeriesId[dayIndex][rowIndex]}
                        />
                    }
                />
                {loading && <Loader active={true} content={'Loading'} />}
                {!loading && <table className="Calendar">
                    {this.state.isExpanded[0]}
                    {rows}
                </table>}
            </div>
        );
    }
}

export default withData(ProfessorCalendarTable);
