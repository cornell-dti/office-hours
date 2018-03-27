import * as React from 'react';
import ProfessorCalendarItem from '../includes/ProfessorCalendarTable';

class ProfessorView extends React.Component {

    state: {
        editVisible: boolean;
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            editVisible: false
        };
        this.toggleEdit = this.toggleEdit.bind(this);
    }

    toggleEdit(toggle: boolean) {
        this.setState({
            editVisible: toggle
        });
    }

    render() {
        var today = (new Date()).toDateString();

        return (
            <div className="ProfessorView">
                <div className={'Add ' + !this.state.editVisible}>
                    <button className="NewOHButton" onClick={() => this.toggleEdit(true)}>
                        <i className="plus icon" />
                        Add New Office Hour
                    </button>
                </div>
                <div className={'ExpandedAdd ' + this.state.editVisible}>
                    <div className='NewOHHeader'>
                        <button className="ExpandedNewOHButton" onClick={() => this.toggleEdit(false)}>
                            <i className="plus icon" />
                            Add New Office Hour
                        </button>
                    </div>
                    <div className="InfoInput">
                        <div className="TA">
                            <i className="user icon" />
                            <input className="long" placeholder="TA Name" />
                            <button className="AddTAButton">
                                <i className="plus icon" />
                                Add TA
                            </button>
                        </div>
                        <div className="Location">
                            <i className="marker icon" />
                            <input className="long" placeholder="Building/Location" />
                            <input placeholder="Room Number" />
                        </div>
                        <div className="Time">
                            <i className="time icon" />
                            <input placeholder={today} />
                            <input placeholder="12:00 PM" />
                            To
                            <input placeholder="2:00 PM" />
                            <input className="repeat" type="checkbox" />
                            Repeat Weekly
                        </div>
                    </div>
                    <div className="Buttons">
                        <button className="Create">
                            Create
                        </button>
                        <button className="Cancel" onClick={() => this.toggleEdit(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
                <div className="Calendar">
                    <ProfessorCalendarItem
                        mondayList={[['11:00 AM to 12:00 PM', '12:00 PM to 2:00 PM'], ['Zechen Zhang', 'Bob'], ['Gates Hall G01', 'Gates Hall G21']]}
                        tuesdayList={[['11:00 AM to 12:00 PM', '12:00 PM to 2:00 PM'], ['Zechen Zhang', 'Bob'], ['Gates Hall G01', 'Gates Hall G21']]}
                        wednesdayList={[['11:00 AM to 12:00 PM', '12:00 PM to 2:00 PM'], ['Zechen Zhang', 'Bob'], ['Gates Hall G01', 'Gates Hall G21']]}
                        thursdayList={[['11:00 AM to 12:00 PM', '12:00 PM to 2:00 PM'], ['Zechen Zhang', 'Bob'], ['Gates Hall G01', 'Gates Hall G21']]}
                        fridayList={[[], [], []]} // Empty
                        saturdayList={[['11:00 AM to 12:00 PM', '12:00 PM to 2:00 PM'], ['Zechen Zhang', 'Bob'], ['Gates Hall G01', 'Gates Hall G21']]}
                        sundayList={[['11:00 AM to 12:00 PM', '12:00 PM to 2:00 PM'], ['Zechen Zhang', 'Bob'], ['Gates Hall G01', 'Gates Hall G21']]}
                    />
                </div>
            </div>
        );
    }
}

export default ProfessorView;
