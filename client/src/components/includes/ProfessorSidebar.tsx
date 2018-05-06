import * as React from 'react';
import { Icon } from 'semantic-ui-react';

class ProfessorSidebar extends React.Component {
    props: {
        course: string
    };


    render() {
        return (
            <div className="ProfessorSidebar">
                <div className="header">
                    <span>
                        {this.props.course}
                        <Icon name="dropdown" />
                    </span>
                </div>
                <div className="manage">
                    <div>
                        <span>
                            <Icon name="users" />
                            People
                        </span>
                    </div>
                    <div>
                        <span>
                            <Icon name="help" />
                            Question
                        </span>
                    </div>
                </div>
                <div className="divider" />
                <div className="actions">
                    <div>
                        <span className="selected">
                            <Icon name="setting" />
                            Manage Hours
                        </span>
                    </div>
                    <div>
                        <span>
                            <Icon name="settings" />
                            Settings
                        </span>
                    </div>
                    <div>
                        <span>
                            <Icon name="log out" />
                            Logout
                        </span>
                    </div>
                </div>
                <svg className="logo" width="100" height="100">
                    <circle cx="50" cy="50" r="10" fill="dodgerblue" />
                </svg>
            </div>
        );
    }
}

export default ProfessorSidebar;