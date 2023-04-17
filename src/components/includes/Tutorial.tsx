import React, { } from 'react';
import { RootState } from '../../redux/store';
import {connect} from 'react-redux'
import { CURRENT_SEMESTER, START_DATE } from '../../constants';
import {importProfessorsOrTAsFromCSV} from '../../firebasefunctions/importProfessorsOrTAs';


type Props = FireComment & {
    user: FireUser | undefined;
    course: FireCourse;
}

const Tutorial = ({ user, course }: Props) => {
    // Creates a question during the tutorial to demonstrate how the screen appears when this happens
    const createQuestion = () => {}
    // Makes the user a TA so they can see TA view
    const makeRole = (role: ('professor' | 'ta')) => {
        const year = (new Date(START_DATE)).getFullYear() % 100;
        const term = CURRENT_SEMESTER.substr(0, 2);
        if(user !== undefined) {
            importProfessorsOrTAsFromCSV(course, role, [user?.userId]);
        }
    }
   return (<>
   </>
    );
}

const mapStateToProps = (state: RootState) => ({
    user : state.auth.user,
})


export default connect(mapStateToProps, {})(Tutorial);