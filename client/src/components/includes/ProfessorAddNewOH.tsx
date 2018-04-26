import * as React from 'react';
import { Icon } from 'semantic-ui-react'
import 'react-datepicker/dist/react-datepicker.css';
import ProfoessorOHInfo from './ProfessorOHInfo';

class ProfessorAddNewOH extends React.Component {

    props: {
        taList: string[]
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
            <div className="ProfessorAddNewOH">
                <div className="Delete">
                </div>
                <div className={'Add ' + !this.state.editVisible}>
                    <button className="NewOHButton" onClick={() => this.toggleEdit(true)}>
                        <Icon name="plus" />
                        Add New Office Hour
                    </button>
                </div>
                <div className={'ExpandedAdd ' + this.state.editVisible}>
                    <div className="NewOHHeader">
                        <button className="ExpandedNewOHButton" onClick={() => this.toggleEdit(false)}>
                            <Icon name="plus" />
                            Add New Office Hour
                        </button>
                    </div>
                    <ProfoessorOHInfo
                        taList={this.props.taList}
                    />
                    <div className="Buttons">
                        <button className="Create">
                            Create
                        </button>
                        <button className="Cancel" onClick={() => this.toggleEdit(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProfessorAddNewOH;
