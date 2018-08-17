import * as React from 'react';
import { Icon, DropdownItemProps } from 'semantic-ui-react';
import ProfessorOHInfo from '../includes/ProfessorOHInfo';
import ProfessorTagInfo from './ProfessorTagInfo';
import 'react-datepicker/dist/react-datepicker.css';

class ProfessorAddNew extends React.Component {

    props: {
        courseId: number
        taOptions?: DropdownItemProps[]
        refreshCallback: Function
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

        var text = this.props.taOptions ? 'Add New Office Hour' : 'Add New Assignment';

        return (
            <div className="ProfessorAddNew">
                <div className={'Add ' + !this.state.editVisible}>
                    <button className="NewOHButton" onClick={() => this.toggleEdit(true)}>
                        <Icon name="plus" />
                        {text}
                    </button>
                </div>
                <div className={'ExpandedAdd ' + this.state.editVisible}>
                    <div className="NewOHHeader">
                        <button className="ExpandedNewOHButton" onClick={() => this.toggleEdit(false)}>
                            <Icon name="plus" />
                            {text}
                        </button>
                    </div>
                    {this.props.taOptions ?
                        <ProfessorOHInfo
                            courseId={this.props.courseId}
                            isNewOH={true}
                            taOptions={this.props.taOptions}
                            toggleEdit={() => this.toggleEdit(false)}
                            taUserIdsDefault={[]}
                            refreshCallback={this.props.refreshCallback}
                        />
                        :
                        <ProfessorTagInfo
                            isNew={true}
                            cancelCallback={() => this.toggleEdit(false)}
                            refreshCallback={this.props.refreshCallback}
                            courseId={this.props.courseId}
                            suggestedTagNames={['Debugging', 'Conceptual']}
                        />
                    }
                </div>
            </div>
        );
    }
}

export default ProfessorAddNew;
