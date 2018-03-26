import * as React from 'react';

class ProfessorCalendarRow extends React.Component {

    props: {
        time: string[]
        ta: string[]
        location: string[]
        tablewidth: number
    };

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
                    <tr>
                        <td>{this.props.time[index]}</td>
                        <td>{this.props.ta[index]}</td>
                        <td>{this.props.location[index]}</td>
                        <td>
                            <button className="Edit">
                                <i className="pencil icon" />
                            </button>
                        </td>
                        <td>
                            <button className="Delete">
                                <i className="x icon" />
                            </button>
                        </td>
                    </tr>
                );
            }
        );

        return (
            rows
        );
    }
}

export default ProfessorCalendarRow;
