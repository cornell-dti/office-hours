import * as React from 'react';
import moment from 'moment';
import { Icon, DropdownItemProps } from 'semantic-ui-react';
import 'react-datepicker/dist/react-datepicker.css';
import ProfessorOHInfo from './ProfessorOHInfo';
import { firestore } from '../../firebase';

const getUsers = async (sessions: FireSession[]): Promise<FireUser[]> => {
    const taSet = new Set<string>();
    sessions.forEach(session => session.tas.forEach(ta => taSet.add(ta)));
    const userDocuments = await Promise.all(Array.from(taSet).map(id => firestore.collection('users').doc(id).get()));
    return userDocuments.map(document => ({
        userId: document.id,
        ...(document.data() as Omit<FireUser, 'userId'>)
    }));
};

const ProfessorCalendarRow = (props: {
    dayNumber: number;
    sessions: FireSession[];
    courseId: string;
    taOptions: DropdownItemProps[];
    isExpanded: boolean[];
    handleEditToggle: (day: number, row: number, forceClose?: boolean) => void;
    updateDeleteInfo: Function;
    updateDeleteVisible: Function;
}) => {

    const toggleEdit = (row: number, close?: boolean) => {
        props.handleEditToggle(props.dayNumber, row, close);
    };

    const updateDeleteInfo = (dayIndex: number, rowIndex: number) => {
        props.updateDeleteInfo(dayIndex, rowIndex);
        props.updateDeleteVisible(true);
    };

    const [users, setUsers] = React.useState<FireUser[]>([]);
    React.useEffect(() => {
        getUsers(props.sessions).then(latestUsers => setUsers(latestUsers));
    }, [props.sessions]);

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
            : 'No TA Assigned';
    };

    const rows = props.sessions.map(
        (session, i) => {
            return (
                <tbody
                    className={'Pair ' + props.isExpanded[i] + ' ' + (i % 2 === 0 ? 'odd' : 'even')}
                    key={session.sessionId}
                >
                    <tr className="Preview">
                        <td>
                            {moment(session.startTime.seconds * 1000).format('h:mm A')}
                            {' to '}
                            {moment(session.endTime.seconds * 1000).format('h:mm A')}
                        </td>
                        <td>
                            {props.sessions[i].tas.map(taId => nameOfTaId(taId)).join(', ')}
                        </td>
                        {session.modality !== "virtual" ? <td>{session.building} {session.room}</td> : <td/>}
                        <td>
                            <button
                                type="button"
                                className="Edit"
                                onClick={() => toggleEdit(i)}
                            >
                                <Icon name="pencil" />
                            </button>
                        </td>
                        <td>
                            <button
                                type="button"
                                className="Delete"
                                onClick={() => updateDeleteInfo(props.dayNumber, i)}
                            >
                                <Icon name="x" />
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td className={'ExpandedEditScreen ' + props.isExpanded[i]}>
                            <div className={'ExpandedEdit ' + props.isExpanded[i]}>
                                <ProfessorOHInfo
                                    key={props.sessions[i].sessionId}
                                    session={props.sessions[i]}
                                    courseId={props.courseId}
                                    isNewOH={false}
                                    taOptions={props.taOptions}
                                    toggleEdit={() => toggleEdit(i, true)}
                                />
                                <button
                                    type="button"
                                    className="Bottom Delete"
                                    onClick={() => updateDeleteInfo(props.dayNumber, i)}
                                >
                                        Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody >
            );
        }
    );
    return <>{rows}</>;
};

export default ProfessorCalendarRow;
