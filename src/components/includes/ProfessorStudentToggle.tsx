import * as React from 'react';

type Props = {
    courseId: string;
    context: string;
};

export default ({ courseId, context }: Props): React.ReactElement => {
    const isProf = context === 'professor';
    const ref = React.useRef<HTMLDivElement>(null);

    return (
        <div className="Header" ref={ref}>
            <div className="CalendarHeaderProfessorView">
                <div className={(!isProf? "SelectedProfessorView": "UnselectedProfessorView") + "Queue"}>
                    <a 
                        href={'/course/' + courseId}
                    > QUEUE
                    </a>
                </div>
                <div className={(isProf ? "SelectedProfessorView" : "UnselectedProfessorView") + "Dashboard"}>
                    <a 
                        href={'/professor/course/' + courseId}
                    > DASHBOARD 
                    </a>
                </div>
            </div>
        </div>
    );
};
