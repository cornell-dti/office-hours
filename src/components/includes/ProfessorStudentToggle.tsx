import * as React from 'react';
import { useHistory } from 'react-router';
import Toggle from '../../media/Toggle.svg';

type Props = {
    courseId: string;
    context: string;
};

export default ({ courseId, context }: Props): React.ReactElement => {
    const isProf = context === 'professor';
    const ref = React.useRef<HTMLDivElement>(null);
    const history = useHistory();

    const courseClicked = (courseId: string) => {
        history.push('/course/' + courseId);
    }

    const profCourseClicked = (courseId: string) => {
        history.push('/professor/course/' + courseId);
    }

    return (
        <div className="Header" ref={ref}>
            <div className="CalendarHeaderProfessorView">
                <div className={(!isProf ? "SelectedProfessorView" : "UnselectedProfessorView") + "Queue"}>
                    <div
                        className={isProf ? "" : "thisCourse"}
                        onClick={() => courseClicked(courseId)}
                    > QUEUE {!isProf && <>&#10003;</>}
                    </div>
                </div>
                <div className={(isProf ? "SelectedProfessorView" : "UnselectedProfessorView") + "Dashboard"}>
                    <div
                        onClick={() => profCourseClicked(courseId)}
                    > DASHBOARD
                    </div>
                </div>
            </div>
        </div>
    );
};
