import React, { useState } from 'react';
import Driver from 'driver.js'
import 'driver.js/dist/driver.min.css'
import { RootState } from '../../../redux/store';
import { connect } from 'react-redux'
import { CURRENT_SEMESTER, START_DATE } from '../../../constants';
import { importProfessorsOrTAsFromCSV } from '../../../firebasefunctions/importProfessorsOrTAs';
import Logo from '../../../media/QLogo2.svg';
import { useCourse } from '../../../firehooks';
import Next from '../../../media/tutorial-next.svg';
import Prev from '../../../media/tutorial-prev.svg';

type Props = {
    user: FireUser | undefined;
    tutorialVisible: boolean;
    setTutorialVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfessorTutorial = ({ user, tutorialVisible, setTutorialVisible }: Props) => {
    const [tutorialState, setTutorialState] = useState(0);
    const driver = new Driver({ allowClose: false, animate: false, opacity: 0.4, padding: 0 });
    const startTutorial = () => {
        setTutorialState(tutorialState + 1);
        driver.defineSteps([
            {
                element: "#ProfessorQueue",
                popover: {
                    title: ' ',
                    description: 'To select a student on the queue to assist, click on "Assign to me". This will take them off the section for unassigned queue questions.',
                    position: 'bottom'
                }
            },
            {
                element: "#ProfessorDashboard",
                popover: {
                    title: ' ',
                    description: '[dashboard info]',
                    position: 'bottom'
                }
            },
            {
                element: "#AddOHButton",
                popover: {
                    title: ' ',
                    description: '[add new oh]',
                    position: 'bottom'
                }
            },
            {
                element: "#profSettings",
                popover: {
                    title: ' ',
                    description: 'Click on settings to change queue functionality',
                    position: 'left'
                }
            },
            {
                element: "#ManageHours",
                popover: {
                    title: ' ',
                    description: '[manage hours placeholder]',
                    position: 'right'
                }
            },
            {
                element: "#ManageTags",
                popover: {
                    title: ' ',
                    description: '[manage tags placeholder]',
                    position: 'right'
                }
            },
        ]);

        driver.start();
    }
    const year = (new Date(START_DATE)).getFullYear() % 100;
    const term = CURRENT_SEMESTER.substr(0, 2);
    const course = useCourse(`TC00${1}-${term}-${year}`);

    const clearTutorial = () => {
        setTutorialState(1);
        // undo user flag
    }

    return (<>
        {tutorialState === 0 && (<div className="tutorial__wrapper">
            <div className="tutorial__content">
                <img src={Logo} className="tutorial__logo" alt="Queue Me In Logo" />
                <div className="tutorial__title">Welcome</div>
                <div className="tutorial__caption">Queue Me In makes office hours easy.</div>
                <div className="tutorial__start" onClick={startTutorial}>Start Tutorial</div>
                <div className="tutorial__skiptext">Not your first time using Queue Me In?&nbsp;<span className="tutorial__skip" onClick={clearTutorial}>Skip the tutorial</span> </div>
            </div>
        </div>)}
    </>
    );

}

const mapStateToProps = (state: RootState) => ({
    user: state.auth.user,
})


export default connect(mapStateToProps, {})(ProfessorTutorial);