import React from 'react';
import {connect} from 'react-redux';
import { removeBanner } from '../../redux/actions/announcements';

type Props = {
    icon: string;
    announcement: string;
    warning?: boolean
    removeBanner: (banner: string) => Promise<void>;
}

const Banner = ({icon, announcement, warning, removeBanner}: Props) => {
    return ( <>
        <div className={`banner__wrapper ${warning ? "banner__alert" : ""}`} >
            <div className="banner__left" > 
                <img src={icon} alt="Text icon" className="banner__icon" />
                <div className="banner__text">{announcement}</div>
            </div>
            <div
                className="banner__close"
                onClick={() => {
                    removeBanner(announcement);
                }}
            >GOT IT</div>
        </div>
    </>
    );
}


export default connect(null, {removeBanner})(Banner);