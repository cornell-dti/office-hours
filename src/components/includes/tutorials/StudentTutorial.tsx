import React, { useState } from 'react';
import { driver } from 'driver.js';
import "driver.js/dist/driver.css";
import { connect } from 'react-redux'
import { RootState } from '../../../redux/store';

import { CURRENT_SEMESTER, START_DATE } from '../../../constants';
import { importProfessorsOrTAsFromCSV } from '../../../firebasefunctions/importProfessorsOrTAs';
import Logo from '../../../media/QLogo2.svg';
import { useCourse } from '../../../firehooks';
import Next from '../../media/tutorial-next.svg';
import Prev from '../../media/tutorial-prev.svg';

type Props = {
    user: FireUser | undefined;
    tutorialVisible: boolean;
    setTutorialVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
/**
 * Provides an interactive tutorial for first-time student users to navigate the session webpage.
 * Steps include selecting a date and office hours, joining the queue, viewing the zoom link, and
 * a start tutorial button.
 * @param user: the current user
 * @param tutorialVisible: whether the tutorial is visible
 * @param setTutorialVisible: function to set whether the tutorial is visible
 * @returns the rendered StudentTutorial component
 */
const StudentTutorial = ({ user, tutorialVisible, setTutorialVisible }: Props) => {
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
            element: "#AddQuestion",
            popover: {
                title: ' ',
                description: `Now, you can join the office hours queue. You can 
                    select the category of assignment, a subtag of the category that
                    relates to the topic you want to discuss, and write a question that
                    will be visible to TAs.`,
                side: 'top'
                // TODO-sophie: figma has a learn more button here...not sure what it does
            }
        },
        {
            element: "#ZoomLink",
            popover: {
                title: ' ',
                description: 'If your professor or TA has provided a zoom link, you can access it here.',
                side: 'right'
            }
        },
        {
            element: "#notifications__top",
            popover: {
                title: ' ',
                description: 'You can rewatch this tutorial and find more information by clicking on the question mark.',
                side: 'right',
                disableButtons: ["next"],
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
        setTutorialVisible(false);
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
        setTutorialVisible(false);
        // undo user flag
    }

    return (<>
        {tutorialVisible && (<div className="tutorial__wrapper">
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


export default connect(mapStateToProps, {})(StudentTutorial);