import * as React from 'react';
import * as moment from 'moment';
import { Icon, DropdownItemProps } from 'semantic-ui-react';
import 'react-datepicker/dist/react-datepicker.css';
import ProfessorOHInfo from './ProfessorOHInfo';
import { Observable } from 'rxjs';
import { firestore, collectionData } from 'src/firebase';

const ProfessorCalendarRow = (props: {
    dayNumber: number,
    sessions: FireSession[],
    courseId: string,
    taOptions: DropdownItemProps[],
    isExpanded: boolean[],
    handleEditToggle: Function,
    updateDeleteInfo: Function,
    updateDeleteVisible: Function,
}) => {

    const toggleEdit = (row: number) => {
        props.handleEditToggle(props.dayNumber, row);
    };

    const updateDeleteInfo = (dayIndex: number, rowIndex: number) => {
        props.updateDeleteInfo(dayIndex, rowIndex);
        props.updateDeleteVisible(true);
    };

    let tas = new Set();
    props.sessions.forEach(s => tas.add(s.tas));
    // Include a default value so firebase doesn't throw an exception
    // for the case where we are looking for 0 TAs
    const tasList = [...Array.from(tas), 'DEFAULT VALUE'];

    const [users, setUsers] = React.useState<FireUser[]>([]);

    React.useEffect(
        () => {
            const tas$: Observable<FireUser[]> = collectionData(
                firestore
                    .collection('users')
                    .where('userId', 'in', tasList),
                'userId'
            );

            const subscription = tas$.subscribe(u => setUsers(u));
            return () => subscription.unsubscribe();
        },
        [tasList.join('')]
    );

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

    const nameOfTaId = (taId: string) => {
        const taUser = users.find(ta => ta.userId === taId);
        return taUser
            ? taUser.firstName + ' ' + taUser.lastName
            : 'Unknown';
    };

    const rows = props.sessions.map(
        (row, i) => {
            return (
                <tbody
                    className={'Pair ' + props.isExpanded[i] + ' ' + (i % 2 === 0 ? 'odd' : 'even')}
                    key={props.sessions[i].sessionId}
                >
                    <tr className="Preview">
                        <td>
                            {moment(props.sessions[i].startTime).format('h:mm A')}
                            {' to '}
                            {moment(props.sessions[i].endTime).format('h:mm A')}
                        </td>
                        <td>
                            {props.sessions[i].tas.map(taId => nameOfTaId(taId.id))}
                        </td>
                        <td>{props.sessions[i].building} {props.sessions[i].room}</td>
                        <td>
                            <button
                                className="Edit"
                                onClick={() => toggleEdit(i)}
                            >
                                <Icon name="pencil" />
                            </button>
                        </td>
                        <td>
                            <button
                                className="Delete"
                                onClick={() => updateDeleteInfo(props.dayNumber, i)}
                            >
                                <Icon name="x" />
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={5} className={'ExpandedEdit ' + props.isExpanded[i]} >
                            <ProfessorOHInfo
                                key={props.sessions[i].sessionId}
                                session={props.sessions[i]}
                                courseId={props.courseId}
                                isNewOH={false}
                                taOptions={props.taOptions}
                                toggleEdit={() => toggleEdit(i)}
                            />
                            <button
                                className="Bottom Delete"
                                onClick={() => updateDeleteInfo(props.dayNumber, i)}
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
        <>
            {rows}
        </>
    );
};

export default ProfessorCalendarRow;
