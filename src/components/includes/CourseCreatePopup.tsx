import * as React from 'react';
import './CourseCreatePopup.scss'
import { useState } from 'react';

import CreateCourseImg from '../../media/createCourseImage.png';


//CiSquarePlus
const CourseCreatePopup = ({setCourseCreatePopup}:any) => {
    const [courseCreatePopupContinue, setCourseCreatePopupContinue] = useState(false)


    return (
        courseCreatePopupContinue ? 
        <div className='courseCreatePopupBackground'>
            <div className='createCoursePopupContinueContainer'>
                <img className='createCourseImg' src={CreateCourseImg} alt="logo" />
                <form className='inputs'>
                    <h1>Create a New Class</h1>
                    <div className='role_input'>
                        <p>I'm a...*</p>
                        <p>Professor</p>
                        <input type="radio" id="professor" name="fav_language" value="HTML"></input>
                        <p>TA</p>
                        <input type="radio" id="ta" name="fav_language" value="HTML"></input>
                    </div>
                    <label className='input_component'> Course Code*
                        <input type='text' name="test" value=""/>
                    </label>
                    <label className='input_component'> Course Name*
                        <input type='text' name="test" value=""/>
                    </label>
                    <div className="dropdownSection">
                        <label className='input_component'> Year*
                            <select>
                                <option value='value'>2023</option>
                                <option value='value'>2024</option>
                                <option value='value'>2025</option>
                            </select>
                        </label>
                        <label className='input_component'> Term*
                            <select>
                                <option value='value'>Spring</option>
                                <option value='value'>Fall</option>
                            </select>
                        </label>
                    </div>
                    
                </form>
                <button className='submit' onClick={() => setCourseCreatePopup(false)}>
                    Submit
                </button>
            </div>
        </div> 
        :
        <div className="courseCreatePopupBackground">
            <div className='createCoursePopupContainer'>
              <img className='createCourseImg' src={CreateCourseImg} alt="logo" />
                <h1>Create a New Class</h1>
                <p>Please proceed only if you are a professor or authorized TA. The QMI team will verify your submission.</p>
                <div className='buttons'>
                    <button className='cancel' onClick={() => setCourseCreatePopup(false)}>
                        Cancel
                    </button>
                    <button className='continue' onClick={() => setCourseCreatePopupContinue(true)}>
                        Continue
                    </button>
                </div>
                
            </div>
        </div>
      
    )
};



export default CourseCreatePopup;
