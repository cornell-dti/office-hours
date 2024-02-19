import React, { useState } from 'react';
import { driver } from 'driver.js';
import "driver.js/dist/driver.css";
import { connect } from 'react-redux'
import { RootState } from '../../../redux/store';

import { CURRENT_SEMESTER, START_DATE } from '../../../constants';
import { importProfessorsOrTAsFromCSV } from '../../../firebasefunctions/importProfessorsOrTAs';
import Logo from '../../../media/QLogo2.svg';
import { useCourse } from '../../../firehooks';
import { updateTaTutorial } from '../../../firebasefunctions/tutorials';

type Props = {
    tutorialUser: FireUser | undefined;
}

const TaTutorial = ({ tutorialUser }: Props) => {
    const driverObj = driver({
        onPopoverRender: (popover, { config, state }) => {
            popover.footerButtons.insertBefore(popover.progress, popover.footerButtons.childNodes[1]);
        },
        showProgress: true,
        allowClose: true, // ends tut when click out of it....
        animate: true,
        overlayOpacity: 0.4,
        stagePadding: 0,
        popoverClass: 'tutorial-theme',
        steps: [{
            element: "#CalendarDaySelect",
            popover: {
                title: ' ',
                description: 'To view office hour availabilities during the week, click on a date within the calendar.',
                side: 'right'
            }
        },
        {
            element: "#CalendarSessions",
            popover: {
                title: ' ',
                description: 'Once you select a date, you can view ongoing and upcoming office hours. This will display how busy the queue is. You can then click the queue you want to join.',
                side: 'right'
            }
        },
        {
            element: "#QueueQuestions",
            popover: {
                title: ' ',
                description: `To select a student on the queue to assist, click 
                on “Assign to me.” This will take them off the section for 
                unassigned queue questions.`,
                side: 'top'
            }
        },
        {
            element: "#AssignedQuestionDone",
            popover: {
                title: ' ',
                description: `When you finish helping a student, you can click 
                “Done” to remove them from the queue completely.`,
                side: 'top'
                // TODO-sophie: figma has a learn more button here...not sure what it does
            }
        },
        {
            element: "#ZoomLink", // SessionInformationHeader doesnt work..
            popover: {
                title: ' ',
                description: `If you have provided a Zoom link for office hours, 
                you can access it here.`,
                side: 'right'
            }
        },
        {
            element: "#notifications__top",
            popover: {
                title: ' ',
                description: `You can rewatch this tutorial and find more 
                information by clicking on the question mark.`,
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
        }]
    });
    const startTutorial = () => {
        updateTaTutorial(tutorialUser, false)
        driverObj.drive();

    }
    const year = (new Date(START_DATE)).getFullYear() % 100;
    const term = CURRENT_SEMESTER.substr(0, 2);
    const course = useCourse(`TC00${1}-${term}-${year}`);
    // Creates a question during the tutorial to demonstrate how the screen appears when this happens
    // const createQuestion = () => {}
    // Makes the user a TA so they can see TA view
    // const makeRole = (role: ('professor' | 'ta')) => {
    //     if(user !== undefined && course !== undefined) {
    //         importProfessorsOrTAsFromCSV(course, role, [user?.userId]);
    //     }
    // }
    const clearTutorial = () => {
        updateTaTutorial(tutorialUser, false)
    }

    return (<>
        {tutorialUser!.taTutorial && (<div className="tutorial__wrapper">
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


export default connect(mapStateToProps, {})(TaTutorial);