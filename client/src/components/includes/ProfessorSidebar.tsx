import * as React from 'react';
import { Sidebar, Menu, Icon } from 'semantic-ui-react';

class ProfessorSidebar extends React.Component {
    render() {
        return (
            <Sidebar as={Menu} animation='slide along' width='thin' visible={true} icon='labeled' vertical inverted>
                <Menu.Item name='home'>
                    <Icon name='home' />
                    Home
            </Menu.Item>
                <Menu.Item name='gamepad'>
                    <Icon name='gamepad' />
                    Games
            </Menu.Item>
                <Menu.Item name='camera'>
                    <Icon name='camera' />
                    Channels
            </Menu.Item>
            </Sidebar>
        );
    }
}

export default ProfessorSidebar;