import * as React from 'react';
import * as NumericInput from 'react-numeric-input';
import 'react-datepicker/dist/react-datepicker.css';
import { Checkbox } from 'semantic-ui-react';

class ProfessorTagInfo extends React.Component {

    props: {
        isNew: boolean
        assignmentName?: string
        isActivated?: boolean
        numQuestions?: number
    };

    constructor(props: {}) {
        super(props);
    }

    render() {
        var defaultNumQuestions: number = (this.props.numQuestions === undefined) ? 1 : this.props.numQuestions;

        return (
            <React.Fragment>
                <div className="ProfessorTagInfo">
                    <div className="Divider">
                        <div className="Assignment">
                            Assignment Name
                            <div className="AssignmentInput">
                                <input placeholder="Recursion Lab" value={this.props.assignmentName} />
                            </div>
                        </div>
                        <div className="NumQuestions">
                            Number of Questions
                            <div className="NumericInput">
                                <NumericInput min={0} max={99} value={defaultNumQuestions} snap={true} strict={true} />
                            </div>
                        </div>
                        <div className="IsActivated">
                            <Checkbox
                                label="Activated?"
                                checked={this.props.isActivated}
                            />
                        </div>
                    </div>
                </div>
                {this.props.isNew ?
                    <button className="Mutation" >
                        Create
                    </button>
                    :
                    <button className="Mutation" >
                        Save Changes
                    </button>
                }
            </React.Fragment>
        );
    }
}

export default ProfessorTagInfo;
