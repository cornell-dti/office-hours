import * as React from 'react';
import DTILogo from '../../media/dti_logo.svg';

const Footer = () => {
    return (
        <div className="footerWrapper">
            <div className="footerTextWrapper">
                <p className="footerText">Made by</p>
                <img className="footerLogo" src={DTILogo} alt="DTI Logo"/>
                <p className="footerText">{"Cornell Design \n& Tech Initiative"}</p>
            </div>
        </div>
    )
}

export default Footer;