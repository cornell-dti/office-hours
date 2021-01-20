import * as React from 'react';
import { DropdownItemProps } from 'semantic-ui-react';
import ProfessorCalendarRow from './ProfessorCalendarRow';
import ProfessorDelete from './ProfessorDelete';
import ProfessorOHInfoDelete from './ProfessorOHInfoDelete';

type Props = {
    courseId: string;
    course?: FireCourse;
    sessions: FireSession[];
    taOptions: DropdownItemProps[];
};

const ProfessorCalendarTable: React.FC<Props> = (props) => {
    const [isDeleteVisible, setIsDeleteVisible] = React.useState(false);
    const [currentDay, setCurrentDay] = React.useState(0);
    const [currentRow, setCurrentRow] = React.useState(0);
    const [dayIndex, setDayIndex] = React.useState(0);
    const [rowIndex, setRowIndex] = React.useState(0);
    const [isExpanded, setIsExpanded] = React.useState([] as boolean[][]);
    
    const { sessions } = props;

    React.useEffect(() => {
        const sessionsLength = sessions.length;

        const expanded: boolean[][] = [];

        for (let i = 0; i < 7; i++) {
            expanded.push(new Array<boolean>(sessionsLength).fill(false));
        }

        setIsExpanded(expanded);
    }, [sessions])

    const toggleEdit = (day: number, row: number, forceClose?: boolean) => {
        const cDay = currentDay;
        const cRow = currentRow;


        if (!(cDay === day && cRow === row)) {
            isExpanded[cDay][cRow] = false;
        }

        if (forceClose) {
            isExpanded[day][row] = false;
        } else {
            isExpanded[day][row] = !isExpanded[day][row];
        }

        setCurrentDay(day);
        setCurrentRow(row);
        setIsExpanded([...isExpanded]);
    };

    const updateDeleteInfo = (day: number, row: number) => {
        setDayIndex(day);
        setRowIndex(row);
    };

    const memoSessions = React.useMemo(() => {
        const newsessions: FireSession[][] = [];
        for (let day = 0; day < 7; day++) {
            newsessions.push([]);
        }

        sessions.forEach((node: FireSession) => {
            // 0 = Monday..., 5 = Saturday, 6 = Sunday
            const dayIndexQuery = (new Date(node.startTime.toDate()).getDay() + 6) % 7;
            newsessions[dayIndexQuery].push(node);
        });
        return newsessions;
    }, [sessions]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const headers = new Array(7);

    for (let index = 0; index < headers.length; index++) {
        headers[index] = (
            <tr>
                <th colSpan={5}>{days[index]}</th>
            </tr>
        );
    }

    const rows = days.map(
        (dayName, i) => {
            return (
                <React.Fragment key={dayName}>
                    <tbody>
                        <tr>
                            <th colSpan={5}>{dayName}</th>
                        </tr>
                    </tbody>
                    <ProfessorCalendarRow
                        key={dayName}
                        dayNumber={i}
                        sessions={memoSessions[i]}
                        courseId={props.courseId}
                        taOptions={props.taOptions}
                        isExpanded={isExpanded[i]}
                        handleEditToggle={toggleEdit}
                        updateDeleteInfo={updateDeleteInfo}
                        updateDeleteVisible={setIsDeleteVisible}
                    />
                </React.Fragment>
            );
        }
    );

    return (
        <div className="ProfessorCalendarTable">
            {memoSessions[dayIndex][rowIndex] &&
                <ProfessorDelete
                    isDeleteVisible={isDeleteVisible}
                    updateDeleteVisible={setIsDeleteVisible}
                    content={
                        props.course ? <ProfessorOHInfoDelete
                            course={props.course}
                            session={memoSessions[dayIndex][rowIndex]}
                            toggleDelete={() => setIsDeleteVisible(false)}
                            toggleEdit={() => toggleEdit(currentDay, currentRow, true)}
                        /> : <div />
                    }
                />}
            <table className="Calendar">
                {isExpanded[0]}
                {rows}
            </table>
        </div>
    );
}


export default ProfessorCalendarTable;
