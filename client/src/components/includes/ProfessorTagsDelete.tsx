import * as React from 'react';
import { Checkbox } from 'semantic-ui-react';

const ProfessorTagsDelete = (props: {
    assignmentName: string;
    isActivated: boolean;
    numQuestions: number;
}) => (
    <React.Fragment>
        <div className="ProfessorTagsDelete">
            <div className="question"> Are you sure you want to delete this tag? </div>
            <div className="info">
                <div className="assignmentName">
                    {props.assignmentName}
                </div>
                <div>
                    <span>
                        <Checkbox
                            label="Activated?"
                            checked={props.isActivated}
                            readOnly
                        />
                    </span>
                    <span>
                        {`Questions: ${props.numQuestions}`}
                    </span>
                </div>
            </div>
        </div>
        <button className="Delete" type="button"> Delete </button>
    </React.Fragment>
);

export default ProfessorTagsDelete;
