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

    const courseClicked = (path: string, courseId: string) => {
        history.push(path + courseId);
    }

    return (
        <div className="Header" ref={ref}>
            <div className="CalendarHeaderTAView">
                <div className={(!isTA ? "SelectedTAView" : "UnselectedTAView") + "Queue"}>
                    <div
                        className={isTA ? "" : "thisCourse"}
                        onClick={() => courseClicked('/course/', courseId)}
                    > QUEUE {!isTA && <>&#10003;</>}
                    </div>
                </div>
                <div className={(isTA ? "SelectedTAView" : "UnselectedTAView") + "Dashboard"}>
                    <div
                        onClick={() => courseClicked('/ta/course/', courseId)}
                    > DASHBOARD
                    </div>
                </div>
            </div>
        </div>
    );
};
