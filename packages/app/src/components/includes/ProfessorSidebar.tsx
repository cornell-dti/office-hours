import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

type Props = {
    courseId: number | string;
    code: string;
    selected: number;
}

const ProfessorSidebar = ({ courseId, code, selected }: Props) => {
    const selectedArray: string[] = ['', '', '', ''];
    selectedArray[selected] = 'selected';

    return (
        <div className="ProfessorSidebar">
            <div className="nav">
                <div className="header">
                    <span>
                        {code}
                        {/* <Icon name="dropdown" /> */}
                    </span>
                </div>
                {/* <div className="manage">
                        <button className={selectedArray[0]}>
                            <Icon name="users" />
                            People
                            </button>
                        <button className={selectedArray[1]}>
                            <Icon name="help" />
                            Question
                            </button>
                    </div>
                    <div className="divider" /> */}
                <div className="actions">
                    <Link to={'/professor/course/' + courseId}>
                        <button type="button" className={selectedArray[0]}>
                            <Icon name="setting" />
                                Manage Hours
                        </button>
                    </Link>
                    <Link to={'/professor-tags/course/' + courseId}>
                        <button type="button" className={selectedArray[1]}>
                            <Icon name="settings" />
                                Manage Tags
                        </button>
                    </Link>
                    <Link to={'/professor-dashboard/course/' + courseId}>
                        <button type="button" className={selectedArray[2]}>
                            <Icon name="line graph" />
                                Dashboard
                        </button>
                    </Link>
                    <Link to={'/professor-people/course/' + courseId}>
                        <button type="button" className={selectedArray[3]}>
                            <Icon name="users" />
                                People
                        </button>
                    </Link>
                    <Link to={'/professor-roles/course/' + courseId}>
                        <button type="button" className={selectedArray[4]}>
                            <Icon name="id card outline" />
                                Manage Roles
                        </button>
                    </Link>
                </div>
            </div>
            {/* <svg className="logo" width="100" height="100">
                    <circle cx="50" cy="50" r="10" fill="#7ab7fe" />
                </svg> */}
        </div>
    );
}

export default ProfessorSidebar;
