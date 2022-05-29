import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

type Props = {
    courseId: number | string;
    code: string;
    selected: 'hours' | 'tags' | 'dashboard' | 'people' | 'roles';
}

const ProfessorSidebar = ({ courseId, code, selected }: Props) => {
    const css = (condition: boolean) => condition ? 'selected' : ''; 
    return (
        <div className="ProfessorSidebar">
            <div className="nav">
                <div className="header">
                    <span>
                        {code}
                    </span>
                </div>
                <div className="actions">
                    <Link to={'/professor/course/' + courseId}>
                        <button type="button" className={css(selected === 'hours')}>
                            <Icon name="setting" />
                                Manage Hours
                        </button>
                    </Link>
                    <Link to={'/professor-tags/course/' + courseId}>
                        <button type="button" className={css(selected === 'tags')}>
                            <Icon name="settings" />
                                Manage Tags
                        </button>
                    </Link>
                    <Link to={'/professor-dashboard/course/' + courseId}>
                        <button type="button" className={css(selected === 'dashboard')}>
                            <Icon name="line graph" />
                                Tag Analytics
                        </button>
                    </Link>
                    <Link to={'/professor-people/course/' + courseId}>
                        <button type="button" className={css(selected === 'people')}>
                            <Icon name="users" />
                                Question Analytics
                        </button>
                    </Link>
                    <Link to={'/professor-roles/course/' + courseId}>
                        <button type="button" className={css(selected === 'roles')}>
                            <Icon name="id card outline" />
                                Manage Roles
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ProfessorSidebar;
