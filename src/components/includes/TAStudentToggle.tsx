import * as React from 'react';
import { useHistory } from 'react-router';

type Props = {
    courseId: string;
    context: string;
};

export default ({ courseId, context }: Props): React.ReactElement => {
    const isTA = context === 'ta';
    const ref = React.useRef<HTMLDivElement>(null);
    const history = useHistory();

    const courseClicked = (courseId: string) => {
        history.push('/course/' + courseId);
    }

    const taCourseClicked = (courseId: string) => {
        history.push('/ta/course/' + courseId);
    }

    return (
        <div className="Header" ref={ref}>
            <div className="CalendarHeaderTAView">
                <div className={(!isTA ? "SelectedTAView" : "UnselectedTAView") + "Queue"}>
                    <div
                        className={isTA ? "" : "thisCourse"}
                        onClick={() => courseClicked(courseId)}
                    > QUEUE {!isTA && <>&#10003;</>}
                    </div>
                </div>
                <div className={(isTA ? "SelectedTAView" : "UnselectedTAView") + "Dashboard"}>
                    <div
                        onClick={() => taCourseClicked(courseId)}
                    > DASHBOARD
                    </div>
                </div>
            </div>
        </div>
    );
};
