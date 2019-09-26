import * as React from 'react';
import { Loader, Icon, Dropdown, DropdownItemProps } from 'semantic-ui-react';
// import * as moment from 'moment';
// import { Checkbox } from 'semantic-ui-react';

// import gql from 'graphql-tag';
// import { Mutation } from 'react-apollo';

const OPEN_OPTIONS: DropdownItemProps[] = [
    { text: 0, value: 0 },
    { text: 15, value: 15 },
    { text: 30, value: 30 }
];
const CHAR_INCREMENT: number = 5;

class ProfessorSettings extends React.Component {

    props: {

    };

    state: {
        openBefore: DropdownItemProps,
        charLimit: number
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            openBefore: OPEN_OPTIONS[0],
            charLimit: 40
        };

    }

    handleCharLimit(input: string) {
        let parsed = parseInt(input, 10);
        if (!isNaN(parsed) && input.length <= 3 && input.length > 0) {
            this.setState({ charLimit: parsed });
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className="ProfessorSettings">
                    <div className="title">
                        Settings
                    </div>
                    <div className="settingDesc">
                        Queue opens
                        <Dropdown
                            className="openDropdown"
                            compact={true}
                            selection={true}
                            options={OPEN_OPTIONS}
                            value={this.state.openBefore.value}
                            onChange={(e, d) => this.setState({ openBefore: d })}
                        />
                        minutes before the office hour begins.
                        <Loader active={true} inline={true} size="mini" />
                    </div>
                    <div className="settingDesc">
                        The character limit for the queue is &nbsp;
                        <button
                            className="decrement"
                            onClick={(e) => this.setState({
                                charLimit: Math.max(this.state.charLimit - CHAR_INCREMENT, 0)
                            })}
                            disabled={this.state.charLimit <= 0}
                        >
                            <Icon name="minus" />
                        </button>
                        <input
                            className="charLimit"
                            value={this.state.charLimit}
                            onChange={(e) => this.handleCharLimit(e.target.value)}
                        />
                        <button
                            className="increment"
                            onClick={(e) => this.setState({
                                charLimit: Math.min(this.state.charLimit + CHAR_INCREMENT, 999)
                            })}
                        >
                            <Icon name="plus" />
                        </button>
                        <Icon name="check" />
                    </div>
                </div>
                <button
                    className="Delete"
                >
                    Done
                </button>
            </React.Fragment>
        );
    }
}

export default ProfessorSettings;
