import * as React from 'react';
import { Icon } from 'semantic-ui-react';

type Props = {
    isDeleteVisible: boolean;
    updateDeleteVisible: React.Dispatch<React.SetStateAction<boolean>>;
    content: JSX.Element;
}

class ProfessorDelete extends React.Component<Props> {
    updateDeleteVisible = (toggle: boolean) => this.props.updateDeleteVisible(toggle);

    render() {
        return (
            <div className={'ProfessorDelete ' + this.props.isDeleteVisible}>
                <div className="content">
                    <button type="button" className="x" onClick={() => this.updateDeleteVisible(false)}>
                        <Icon name="x" />
                    </button>
                    {this.props.content}
                    <button type="button" className="Cancel" onClick={() => this.updateDeleteVisible(false)}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }
}

export default ProfessorDelete;
