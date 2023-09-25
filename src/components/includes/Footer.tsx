import * as React from "react";
import DTILogo from "../../media/dti_logo_glyph.svg";

const Footer = () => {
    return (
        <div className="footerWrapper">
            <div className="footerTextWrapper">
                <p className="footerText">Made by</p>
                <img className="footerLogo" src={DTILogo} alt="DTI Logo" />
                <p className="footerText">{"Cornell Digital \n Tech & Innovation"}</p>
            </div>
        </div>
    );
};

export default Footer;
