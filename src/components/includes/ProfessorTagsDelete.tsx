import * as React from 'react';
import { Checkbox } from 'semantic-ui-react';

type Props = {
    assignmentName: string;
    isActivated: boolean;
    numQuestions: number;
};

const ProfessorTagsDelete = ({ assignmentName, isActivated, numQuestions }: Props) => {
    return (
        <>
            <div className="ProfessorTagsDelete">
                <div className="question">
                    Are you sure you want to delete this tag?
                </div>
                <div className="info">
                    <div className="assignmentName">
                        {assignmentName}
                    </div>
                    <div>
                        <span>
                            <Checkbox
                                label="Activated?"
                                checked={isActivated}
                                readOnly={true}
                            />
                        </span>
                        <span>
                            Questions: {numQuestions}
                        </span>
                    </div>
                </div>
            </div>
            <button type="button" className="Delete">
                Delete
            </button>
        </>
    );
}

export default ProfessorTagsDelete;
