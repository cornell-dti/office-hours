import * as React from 'react';
import * as moment from 'moment';
import { Icon, DropdownItemProps } from 'semantic-ui-react';
import 'react-datepicker/dist/react-datepicker.css';
import Moment from 'react-moment';
import ProfessorOHInfo from './ProfessorOHInfo';


const ProfessorCalendarRow = (props: {
    dayNumber: number;
    sessions: FireSession[];
    courseId: string;
    taOptions: DropdownItemProps[];
    isExpanded: boolean[];
    handleEditToggle: Function;
    updateDeleteInfo: Function;
    updateDeleteVisible: Function;
    refreshCallback: Function;
}) => {
    const toggleEdit = (row: number) => {
        props.handleEditToggle(props.dayNumber, row);
    };

    const updateDeleteInfo = (dayIndex: number, rowIndex: number) => {
        props.updateDeleteInfo(dayIndex, rowIndex);
        props.updateDeleteVisible(true);
    };

    if (props.sessions.length === 0) {
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

    const rowPair = props.sessions.map(
        (row, i) => (
            <tbody
                className={`Pair ${props.isExpanded[i]} ${i % 2 === 0 ? 'odd' : 'even'}`}
                key={props.sessions[i].id}
            >
                <tr className="Preview">
                    <td>
                        <Moment date={props.sessions[i].startTime.seconds} unix interval={0} format="hh:mm A" />
                        {' to '}
                        <Moment date={props.sessions[i].endTime.seconds} unix interval={0} format="hh:mm A" />
                    </td>
                    <td>
                        {/* TODO */}
                        {/* {props.sessions[i].sessionTasBySessionId.nodes
                            .map(ta => ta.userByUserId.computedName).join(', ')} */}
                    </td>
                    <td>
                        {props.sessions[i].building}
                        {' '}
                        {props.sessions[i].room}
                    </td>
                    <td>
                        <button
                            className="Edit"
                            onClick={() => toggleEdit(i)}
                            type="button"
                        >
                            <Icon name="pencil" />
                        </button>
                    </td>
                    <td>
                        <button
                            className="Delete"
                            onClick={() => updateDeleteInfo(props.dayNumber, i)}
                            type="button"
                        >
                            <Icon name="x" />
                        </button>
                    </td>
                </tr>
                <tr>
                    <td
                        colSpan={5}
                        className={`ExpandedEdit ${props.isExpanded[i]}`}
                    >
                        <ProfessorOHInfo
                            key={props.sessions[i].id}
                            session={props.sessions[i]}
                            courseId={props.courseId}
                            isNewOH={false}
                            taOptions={props.taOptions}
                            toggleEdit={() => toggleEdit(i)}
                            refreshCallback={props.refreshCallback}
                        />
                        <button
                            className="Bottom Delete"
                            onClick={() => updateDeleteInfo(props.dayNumber, i)}
                            type="button"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            </tbody>
        ),
    );

    return (
        rowPair
    );
};

export default ProfessorCalendarRow;
