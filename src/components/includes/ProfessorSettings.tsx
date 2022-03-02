import * as React from 'react';
import { Icon, Dropdown, Checkbox } from 'semantic-ui-react';
import { updateSettingsInCourse } from '../../firebasefunctions/courseSettings';

const OPEN_OPTIONS: { text: string; value: number }[] = [
    { text: '0', value: 0 },
    { text: '15', value: 15 },
    { text: '30', value: 30 }
];
const LIMIT_OPTIONS: { text: string; value: number }[] = [
    { text: '0.5', value: 0.5 },
    { text: '5', value: 5 },
    { text: '10', value: 10 },
    { text: '15', value: 15 },
    { text: '20', value: 20 },
    { text: '25', value: 25 },
    { text: '30', value: 30 }
];

const WARNING_OPTIONS: { text: string; value: number }[] = [
    { text: '0.25', value: 0.25 },
    { text: '1', value: 1 },
    { text: '5', value: 5 },
    { text: '10', value: 10 },
    { text: '15', value: 15 },
    { text: '20', value: 20 },
    { text: '25', value: 25 },
    { text: '30', value: 30 }
];

const CHAR_INCREMENT = 5;

type Props = {
    courseId: string;
    charLimitDefault: number;
    openIntervalDefault: number;
    timeLimit?: number;
    isTimeLimit?: boolean;
    timeWarning?: number;
    toggleDelete: () => void;
};

type State = { openInterval: number; charLimit: number; timeLimit: number; 
    isTimeLimit: boolean; timeWarning: number; showWarningText: boolean; };

class ProfessorSettings extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            openInterval: this.props.openIntervalDefault,
            charLimit: props.charLimitDefault,
            timeLimit: (typeof props.timeLimit === 'undefined') ? 15 : props.timeLimit,
            timeWarning: (typeof props.timeWarning === 'undefined') ? 1 : props.timeWarning,
            isTimeLimit: (typeof props.isTimeLimit === 'undefined') ? false : props.isTimeLimit,
            showWarningText: false
        };
    }

    updateCourseSettings = (): void => {

        const courseUpdate: Partial<FireCourse> = {
            queueOpenInterval: this.state.openInterval,
            charLimit: this.state.charLimit,
            timeLimit: this.state.timeLimit,
            isTimeLimit: this.state.isTimeLimit,
            timeWarning: this.state.timeWarning
        };

        updateSettingsInCourse(this.props.courseId, courseUpdate)
    };

    handleCharLimit = (input: string): void => {
        const parsed = parseInt(input, 10);
        if (!isNaN(parsed) && input.length <= 3 && input.length > 0) {
            this.setState({ charLimit: parsed });
        }
    };

    toggleTimeLimit = (): void => {
        this.setState({ isTimeLimit: !this.state.isTimeLimit });
    }

    render() {
        return (
            <>
                <div className="ProfessorSettings">
                    <div className="title">
                        Queue Settings
                    </div>
                    <div className="settingDesc">
                        Queue opens
                        <Dropdown
                            className="openDropdown"
                            compact={true}
                            selection={true}
                            options={OPEN_OPTIONS}
                            value={this.state.openInterval}
                            onChange={(_, d) => {
                                const openInterval = d.value as number;
                                this.setState({ openInterval });
                            }}
                        />
                        minutes before the office hour begins.
                    </div>
                    <div className="settingDesc">
                        The character limit for the queue is &nbsp;
                        <button
                            type="button"
                            className="decrement"
                            onClick={() => this.setState(({ charLimit }) => ({
                                charLimit: Math.max(charLimit - CHAR_INCREMENT, 0)
                            }))}
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
                            type="button"
                            className="increment"
                            onClick={() => this.setState(({ charLimit }) => ({
                                charLimit: Math.min(charLimit + CHAR_INCREMENT, 999)
                            }))}
                        >
                            <Icon name="plus" />
                        </button>
                    </div>
                    <div className="timeLimitSetting">
                        <Checkbox
                            label="Turn on time limit"
                            checked={this.state.isTimeLimit} 
                            onClick={this.toggleTimeLimit}
                        />
                        {this.state.isTimeLimit &&
                            <div className="timeLimitSelector">
                                Set a limit of
                                <Dropdown
                                    className="openDropdown"
                                    compact={true}
                                    selection={true}
                                    options={LIMIT_OPTIONS}
                                    value={this.state.timeLimit}
                                    onChange={(_, d) => {
                                        const newLimit = d.value as number;
                                        this.setState({ timeLimit: newLimit });
                                    }}
                                />
                                minutes for each question and
                                set a warning at
                                <Dropdown
                                    className="openDropdown"
                                    compact={true}
                                    selection={true}
                                    options={WARNING_OPTIONS}
                                    value={this.state.timeWarning}
                                    onChange={(_, d) => {
                                        const newWarning = d.value as number;
                                        this.setState({ timeWarning: newWarning });
                                    }}
                                />
                                minutes.
                            </div> 
                        }
                    </div>
                    {this.state.showWarningText && 
                        <div className="warningLabel">
                            Can not have warning time be greater than or equal to time limit!
                        </div>
                    }
                </div>
                <button
                    type="button"
                    className="Action"
                    onClick={() => {
                        if (this.state.timeWarning >= this.state.timeLimit) {
                            this.setState({showWarningText: true});
                            return;
                        }
                        this.setState({showWarningText: false});
                        this.updateCourseSettings();
                        this.props.toggleDelete();
                    }}
                >
                    Save
                </button>
            </>
        );
    }
}

export default ProfessorSettings;
