import * as React from 'react';
import { Checkbox } from 'semantic-ui-react';

class ProfessorTagsDelete extends React.Component {
    props!: {
        assignmentName: string;
        isActivated: boolean;
        numQuestions: number;
    };

    render() {
        return (
            <React.Fragment>
                <div className="ProfessorTagsDelete">
                    <div className="question">
                        Are you sure you want to delete this tag?
                    </div>
                    <div className="info">
                        <div className="assignmentName">
                            {this.props.assignmentName}
                        </div>
                        <div>
                            <span>
                                <Checkbox
                                    label="Activated?"
                                    checked={this.props.isActivated}
                                    readOnly={true}
                                />
                            </span>
                            <span>
                                Questions: {this.props.numQuestions}
                            </span>
                        </div>
                    </div>
                </div>
                <button className="Delete">
                    Delete
                </button>
            </React.Fragment>
        );
    }
}

export default ProfessorTagsDelete;
