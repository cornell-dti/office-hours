import * as React from 'react';
import { Icon } from 'semantic-ui-react';

class SessionAlertModal extends React.Component {

    props: {
        color: string,
        description: string,
        action?: Function
    };

    state: {
        isVisible: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            isVisible: false
        };
        this.updateVisible = this.updateVisible.bind(this);
    }

    updateVisible(toggle: boolean) {
        this.state = {
            isVisible: toggle
        };
    }

    render() {
        return (
            <div className="SessionAlertModal">
                <div className="modalShade" />
                <div className="modalContent">
                    <div className="content">
                        <div className="Icon">
                            <Icon name="exclamation" />
                        </div>
                        {this.props.description}
                        <div className="buttons">
                            <button className="cancel">
                                Cancel
                            </button>
                            <button className="addAnyway">
                                Add Anyway
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default SessionAlertModal;
