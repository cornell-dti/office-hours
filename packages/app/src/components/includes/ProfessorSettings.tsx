import { updateCourseSettings } from 'lib/prof/course';
import * as React from 'react';
import { Icon, Dropdown } from 'semantic-ui-react';

const OPEN_OPTIONS: { text: string; value: number }[] = [
    { text: '0', value: 0 },
    { text: '15', value: 15 },
    { text: '30', value: 30 }
];
const CHAR_INCREMENT = 5;

type Props = {
    courseId: string;
    charLimitDefault: number;
    openIntervalDefault: number;
    toggleDelete: () => void;
};

type State = { openInterval: number; charLimit: number };

class ProfessorSettings extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            openInterval: this.props.openIntervalDefault,
            charLimit: props.charLimitDefault
        };
    }

    handleCharLimit = (input: string): void => {
        const parsed = parseInt(input, 10);
        if (!isNaN(parsed) && input.length <= 3 && input.length > 0) {
            this.setState({ charLimit: parsed });
        }
    };

    render() {
        return (
            <>
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
                </div>
                <button
                    type="button"
                    className="Action"
                    onClick={() => {
                        updateCourseSettings(this.props.courseId, this.state.charLimit, this.state.openInterval);
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
