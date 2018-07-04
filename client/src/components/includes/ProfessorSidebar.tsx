import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
class ProfessorSidebar extends React.Component {
    props: {
        course: string,
        selected: number
    };

    render() {
        var selectedArray: string[] = ['', '', '', '', ''];
        selectedArray[this.props.selected] = 'selected';

        return (
            <div className="ProfessorSidebar">
                <div className="nav">
                    <div className="header">
                        <span>
                            {this.props.course}
                            <Icon name="dropdown" />
                        </span>
                    </div>
                    <div className="manage">
                        <button className={selectedArray[0]}>
                            <Icon name="users" />
                            People
                            </button>
                        <button className={selectedArray[1]}>
                            <Icon name="help" />
                            Question
                            </button>
                    </div>
                    <div className="divider" />
                    <div className="actions">
                        <Link to="/professor/course/1">
                            <button className={selectedArray[2]}>
                                <Icon name="setting" />
                                Manage Hours
                                </button>
                        </Link>
                        <Link to="/professor-tags">
                            <button className={selectedArray[3]}>
                                <Icon name="settings" />
                                Manage Tags
                                </button>
                        </Link>
                        <button className={selectedArray[4]}>
                            <Icon name="log out" />
                            Logout
                        </button>
                    </div>
                    <svg className="logo" width="100" height="100">
                        <circle cx="50" cy="50" r="10" fill="dodgerblue" />
                    </svg>
                </div>
            </div>
        );
    }
}

export default ProfessorSidebar;