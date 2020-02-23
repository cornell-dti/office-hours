import * as React from 'react';
import { Icon, Dropdown, DropdownItemProps } from 'semantic-ui-react';

import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

const UPDATE_PROFESSOR_SETTINGS = gql`
    mutation UpdateProfessorSettings($_courseId: Int!, $_charLimit: Int!, $_queueOpenInterval: Int!) {
        apiUpdateCourseSettings(input:{_courseId: $_courseId, _charLimit: $_charLimit, 
            _queueOpenInterval:{
                seconds: 0,
                minutes: $_queueOpenInterval,
                hours: 0,
                days: 0,
                months: 0,
                years: 0
            }
        })
        {
            clientMutationId
        }
    }
`;

const OPEN_OPTIONS: DropdownItemProps[] = [
    { text: 0, value: 0 },
    { text: 15, value: 15 },
    { text: 30, value: 30 }
];
const CHAR_INCREMENT: number = 5;

class ProfessorSettings extends React.Component {

    props: {
        courseId: number,
        charLimitDefault: number,
        openIntervalDefault: number,
        toggleDelete: Function
    };

    state: {
        openInterval: DropdownItemProps,
        charLimit: number
    };

    constructor(props: {}) {
        super(props);
        let o = OPEN_OPTIONS.find(e => e.value === this.props.openIntervalDefault);
        this.state = {
            openInterval: o ? o : OPEN_OPTIONS[0],
            charLimit: this.props.charLimitDefault
        };
    }

    _onClickUpdateProfessorSetttings(UpdateProfessorSettings: Function) {
        UpdateProfessorSettings({
            variables: {
                _courseId: this.props.courseId,
                _charLimit: this.state.charLimit,
                _queueOpenInterval: this.state.openInterval.value
            }
        });
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
                            value={this.state.openInterval.value}
                            onChange={(e, d) => this.setState({ openInterval: d })}
                        />
                        minutes before the office hour begins.
                    </div>
                    <div className="settingDesc">
                        The character limit for the queue is &nbsp;
                        <button
                            className="decrement"
                            onClick={(e) =>
                                this.setState({
                                    charLimit: Math.max(this.state.charLimit - CHAR_INCREMENT, 0)
                                })
                            }
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
                            onClick={(e) =>
                                this.setState({
                                    charLimit: Math.min(this.state.charLimit + CHAR_INCREMENT, 999)
                                })
                            }
                        >
                            <Icon name="plus" />
                        </button>
                    </div>
                </div>
                <Mutation mutation={UPDATE_PROFESSOR_SETTINGS}>
                    {(UpdateProfessorSettings) =>
                        <button
                            className="Action"
                            onClick={(e) => {
                                this._onClickUpdateProfessorSetttings(UpdateProfessorSettings);
                                this.props.toggleDelete();
                            }}
                        >
                            Save
                        </button>
                    }
                </Mutation>
            </React.Fragment>
        );
    }
}

export default ProfessorSettings;