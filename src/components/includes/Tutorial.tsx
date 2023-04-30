import React, { useState } from 'react';
import Driver from 'driver.js'
import 'driver.js/dist/driver.min.css'
import { RootState } from '../../redux/store';
import {connect} from 'react-redux'
import { CURRENT_SEMESTER, START_DATE } from '../../constants';
import {importProfessorsOrTAsFromCSV} from '../../firebasefunctions/importProfessorsOrTAs';
import Logo from '../../media/QLogo2.svg';
import { useCourse } from '../../firehooks';
import Next from '../../media/tutorial-next.svg';
import Prev from '../../media/tutorial-prev.svg';

type Props = {
    user: FireUser | undefined;
    tutorialVisible: boolean;
    setTutorialVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const Tutorial = ({ user, tutorialVisible, setTutorialVisible }: Props) => {
    const [tutorialState, setTutorialState] = useState(0);
    const driver = new Driver({allowClose: false, animate: true, opacity: 0.4, padding: 0});
    const startTutorial = () => {
        setTutorialState(tutorialState + 1);
        driver.defineSteps([
            {
                element: "#CalendarDaySelect",
                popover: {
                    title: ' ',
                    description: 'To view office hour availabilities during the week, click on a date within the calendar.',
                    position: 'right'
                }
            },
            {
                element: "#CalendarSessions",
                popover: {
                    title: ' ',
                    description: 'Once you select a date, you can view ongoing and upcoming office hours. This will display how busy the queue is. You can then click the queue you want to join.',
                    position: 'right'
                }
            },
            {
                element: "#CalendarDaySelect",
                popover: {
                    title: ' ',
                    description: 'Now, you can join the office hours queue. You can \
                    select the category of assignment, a subtag of the category that\
                     relates to the topic you want to discuss, and write a question th\
                    at will be visible to TAs.',
                    position: 'top'
                }
            },
            {
                element: "#CalendarDaySelect",
                popover: {
                    title: ' ',
                    description: 'If your professor or TA has provided a zoom link, you can access it here.',
                    position: 'right'
                }
            },
            {
                element: "#CalendarDaySelect",
                popover: {
                    title: ' ',
                    description: 'You can rewatch this tutorial and find more information by clicking on the question mark.',
                    position: 'right'
                }
            }
        ]);
        driver.start();
    }
    const year = (new Date(START_DATE)).getFullYear() % 100;
        const term = CURRENT_SEMESTER.substr(0, 2);
    const course = useCourse(`TC00${1}-${term}-${year}`);
    // Creates a question during the tutorial to demonstrate how the screen appears when this happens
    const createQuestion = () => {}
    // Makes the user a TA so they can see TA view
    const makeRole = (role: ('professor' | 'ta')) => {
        if(user !== undefined && course !== undefined) {
            importProfessorsOrTAsFromCSV(course, role, [user?.userId]);
        }
    }
    const clearTutorial = () => {
        setTutorialState(1);
        // undo user flag
    }
    
    return (<>
            {tutorialState == 0 && (<div className="tutorial__wrapper">
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
    user : state.auth.user,
})


export default connect(mapStateToProps, {})(Tutorial);