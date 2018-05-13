import * as React from 'react';
import { Icon } from 'semantic-ui-react';

class ProfessorDelete extends React.Component {

    props: {
        isDeleteVisible: boolean,
        updateDeleteVisible: Function,
        content: JSX.Element
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            isToggled: false
        };
        this.updateDeleteVisible = this.updateDeleteVisible.bind(this);
    }

    updateDeleteVisible(toggle: boolean) {
        this.props.updateDeleteVisible(toggle);
    }

    render() {
        return (
            <div className={'ProfessorDelete ' + this.props.isDeleteVisible}>
                <div className="content">
                    <button className="x" onClick={() => this.updateDeleteVisible(false)}>
                        <Icon name="x" />
                    </button>
                    {this.props.content}
                    <span>
                        <button className="Delete">
                            Delete
                        </button>
                        <button className="Cancel" onClick={() => this.updateDeleteVisible(false)}>
                            Cancel
                        </button>
                    </span>
                </div>
            </div>
        );
    }
}

export default ProfessorDelete;
