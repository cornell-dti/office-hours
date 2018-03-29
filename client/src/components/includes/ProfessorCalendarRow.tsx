import * as React from 'react';

class ProfessorCalendarRow extends React.Component {

    props: {
        time: string[]
        ta: string[]
        location: string[]
        tablewidth: number
    };

    state: {
        editVisible: boolean[];
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            editVisible: new Array<boolean>(this.props.time.length).fill(false)
        };
    }

    toggleEdit(toggle: number) {
        this.state.editVisible[toggle] = !this.state.editVisible[toggle]
        this.setState({
            editVisible: this.state.editVisible
        });
    }

    render() {
        if (this.props.time.length === 0) {
            return (
                <tr>
                    <td colSpan={this.props.tablewidth} className="NoOH">
                        <i>No office hours scheduled</i>
                    </td>
                </tr>
            );
        }

        var rows = this.props.time.map(
            (row, index) => {
                return (
                    <tbody className={'Pair ' + this.state.editVisible[index]}>
                        <tr className={'Preview ' + this.state.editVisible[index]}>
                            <td>{this.props.time[index]}</td>
                            <td>{this.props.ta[index]}</td>
                            <td>{this.props.location[index]}</td>
                            <td>
                                <button className="Edit" onClick={() => this.toggleEdit(index)}>
                                    <i className="pencil icon" />
                                </button>
                            </td>
                            <td>
                                <button className="Delete">
                                    <i className="x icon" />
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={this.props.tablewidth} className={'ExpandedEdit ' + this.state.editVisible[index]}>
                                <div className="InfoInput">
                                    <div className="TA">
                                        <i className="user icon" />
                                        <input className="long" value={this.props.ta[index]} />
                                        <button className="AddTAButton">
                                            <i className="plus icon" />
                                            Add TA
                                        </button>
                                    </div>
                                    <div className="Location">
                                        <i className="marker icon" />
                                        <input className="long" value={this.props.location[index]} />
                                        <input value="Room Number" />
                                    </div>
                                    <div className="Time">
                                        <i className="time icon" />
                                        <input value={this.props.time[index]} />
                                        <input value="12:00 PM" />
                                        To
                                        <input value="2:00 PM" />
                                        <input className="repeat" type="checkbox" />
                                        Repeat Weekly
                                    </div>
                                </div>
                                <div className="EditButtons">
                                    <button className="Delete">
                                        Delete
                                    </button>
                                    <button className="Cancel" onClick={() => this.toggleEdit(index)}>
                                        Cancel
                                    </button>
                                    <button className="SaveChanges">
                                        Save Changes
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody >
                );
            }
        );

        return (
            rows
        );
    }
}

export default ProfessorCalendarRow;
