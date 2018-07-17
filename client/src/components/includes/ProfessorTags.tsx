import * as React from 'react';
import ProfessorHeader from '../includes/ProfessorHeader';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import ProfessorAddNew from './ProfessorAddNew';
import ProfoessorTagInfo from './ProfessorTagInfo';
import ProfessorTagsTable from './ProfessorTagsTable';

class ProfessorTags extends React.Component {
    props: {
        courseId: number
    };

    state: {
        selectedWeekEpoch: number
    };
    render() {

        return (
            <div className="ProfessorView">
                <div className="ProfessorTags">
                    <ProfessorSidebar
                        course="CS 1380"
                        selected={3}
                    />
                    <div className="rightOfSidebar">
                        <ProfessorHeader
                            professor="Michael Clarkson"
                            image="https://www.cs.cornell.edu/~clarkson/img/mrc_gates300.jpg"
                            notification={true}
                        />
                        <div className="main">
                            <ProfessorAddNew
                                text={'Add New Assignment'}
                                content={<ProfoessorTagInfo />}
                            />
                            <div className="Calendar">
                                <ProfessorTagsTable
                                    assignmentName={
                                        ['Assignment 1', 'Assignment 2',
                                            'Assignment 3', 'Assignment 4',
                                            'Prelim 1', 'Prelim 2']
                                    }
                                    dateAssigned={
                                        [1522684800000, 1522688400000,
                                            1522695600000, 1522713600000,
                                            1522764000000, 1522764000000]
                                    }
                                    dateDue={
                                        [1522688400000, 1522692000000,
                                            1522699200000, 1522717200000,
                                            1522767600000, 1522767600000]
                                    }
                                    numQuestions={[1, 2, 3, 4, 5, 15]}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProfessorTags;
