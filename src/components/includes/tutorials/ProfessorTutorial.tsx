import React, { useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css'
import { RootState } from '../../../redux/store';
import { connect } from 'react-redux'
import { CURRENT_SEMESTER, START_DATE } from '../../../constants';
import { importProfessorsOrTAsFromCSV } from '../../../firebasefunctions/importProfessorsOrTAs';
import { updateProfTutorial } from '../../../firebasefunctions/tutorials';

import Logo from '../../../media/QLogo2.svg';
import { useCourse } from '../../../firehooks';
import { useHistory } from 'react-router';

type Props = {
    tutorialUser: FireUser | undefined;
    courseId: string;
}

const ProfessorTutorial = ({ tutorialUser, courseId }: Props) => {
    const history = useHistory();
    const clearTutorial = () => {
        updateProfTutorial(tutorialUser, false)
    }
    const driverObj = driver({
        onPopoverRender: (popover, { config, state }) => {
            popover.footerButtons.insertBefore(popover.progress, popover.footerButtons.childNodes[1]);
        },
        showProgress: true,
        allowClose: true,
        animate: true,
        overlayOpacity: 0.4,
        stagePadding: 0,
        popoverClass: 'tutorial-theme',
        steps: [
            {
                element: "#ProfessorQueue",
                popover: {
                    description: 'When you open a course, the queue opens by default. But as a professor, you also have access to a dashboard.',
                    side: 'bottom',
                    onNextClick: () => {
                        clearTutorial();

                        history.push({ pathname: '/professor/course/' + courseId, state: { tutorialState: 1 } });

                        driverObj.moveNext();
                    }
                }
            },
            {
                element: "#ProfessorDashboard",
                popover: {
                    description: 'To switch between views, you click on either the dashboard or queue section based on what view you would like to see.',
                    side: 'bottom'
                }
            },
            {
                element: "#AddOHButton",
                popover: {
                    description: 'To create a new office hours session select \'Add New Office Hour\'',
                    side: 'bottom'
                }
            },
            {
                element: "#profSettings",
                popover: {
                    description: 'Click on settings to change queue functionality',
                    side: 'left'
                }
            },
            {
                element: "#ManageHours",
                popover: {
                    description: 'The manage hours tab is open by default in dashboard view. Here you can view and create office hours sessions.',
                    side: 'right'
                }
            },
            {
                element: "#ManageTags",
                popover: {
                    description: '\'Manage Tags\' section allows you to view, create, and manage tags and assignments. ',
                    side: 'right',
                    onPopoverRender: (popover, { config, state }) => {
                        popover.footerButtons.insertBefore(popover.progress, popover.footerButtons.childNodes[1]);
                        const doneButton = document.createElement("button");
                        doneButton.innerText = "DONE";
                        doneButton.id = "driver-popover-done-btn";
                        popover.footerButtons.appendChild(doneButton);
                        doneButton.addEventListener("click", function () {
                            driverObj.destroy();
                        });
                    },
                }
            },

        ]
    });

    /**
     * This function starts the tutorial by setting the tutorial state so the start tutorial component stops showing and starting the driver object with the steps for the tutorial
     */
    const startTutorial = () => {
        updateProfTutorial(tutorialUser, false)
        driverObj.drive();
    }
    const year = (new Date(START_DATE)).getFullYear() % 100;
    const term = CURRENT_SEMESTER.substr(0, 2);
    const course = useCourse(`TC00${1}-${term}-${year}`);



    return (<>
        {tutorialUser!.profTutorial && (<div className="tutorial__wrapper">
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