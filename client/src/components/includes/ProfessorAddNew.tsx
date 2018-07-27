import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import 'react-datepicker/dist/react-datepicker.css';

class ProfessorAddNew extends React.Component {

    props: {
        text: string;
        content: JSX.Element
    };

    state: {
        editVisible: false
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            editVisible: false
        };
    }

    toggleEdit(toggle: boolean) {
        this.setState({
            editVisible: toggle
        });
    }

    render() {
        return (
            <div className="ProfessorAddNew">
                <div className={'Add ' + !this.state.editVisible}>
                    <button className="NewOHButton" onClick={() => this.toggleEdit(true)}>
                        <Icon name="plus" />
                        {this.props.text}
                    </button>
                </div>
                <div className={'ExpandedAdd ' + this.state.editVisible}>
                    <div className="NewOHHeader">
                        <button className="ExpandedNewOHButton" onClick={() => this.toggleEdit(false)}>
                            <Icon name="plus" />
                            {this.props.text}
                        </button>
                    </div>
                    {this.props.content}
                    <button className="Cancel" onClick={() => this.toggleEdit(false)}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }
}

export default ProfessorAddNew;
