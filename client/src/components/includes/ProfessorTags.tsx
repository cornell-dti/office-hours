import * as React from 'react';
import ProfessorHeader from '../includes/ProfessorHeader';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import ProfessorAddNew from './ProfessorAddNew';
import ProfoessorTagInfo from './ProfessorTagInfo';


class ProfessorTags extends React.Component {

    props: {
        courseId: number
    }

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
                                text={"Add New Assignment"}
                                content={<ProfoessorTagInfo />}
                            />
                            <div className="Calendar">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProfessorTags;
