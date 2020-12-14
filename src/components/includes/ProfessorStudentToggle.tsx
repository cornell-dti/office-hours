import * as React from 'react';
import { useHistory } from 'react-router';
import Toggle from '../../media/Toggle.svg'; 

type Props = {
    courseId: string;
    context: string;
};

export default ({ courseId, context }: Props): React.ReactElement => {
    const history = useHistory();
    const isProf = context === 'professor';

    const [showMenu, setShowMenu] = React.useState(false);

    return (
        <div className="Header">
            <div className="CalendarHeader" onClick={() => setShowMenu(shown => !shown)}>
                <span>
                    <div className="courseCode">
                        {isProf ? "DASHBOARD" : "QUEUE"}
                    </div>
                    <img src={Toggle} alt="Course Select" className="Toggle" />
                </span>
                {showMenu &&
                    <ul className="courseMenu" tabIndex={1} onClick={() => setShowMenu(false)} >
                        <li onMouseDown={() => history.push('/course/' + courseId)}>
                            <a 
                                className={isProf ? "":"thisCourse"}
                                href={'/course/' + courseId}
                            > QUEUE {!isProf && <>&#10003;</>}
                            </a>
                        </li>
                        <li onMouseDown={() => history.push('/professor/course/' + courseId)}>
                            <a 
                                className={isProf ? "thisCourse":""}
                                href={'/professor/course/' + courseId}
                            > DASHBOARD {isProf && <>&#10003;</>}
                            </a>
                        </li>
                    </ul>
                }
            </div>
        </div>
    );
};
