import React from 'react';
import {connect} from 'react-redux';
import { removeBanner } from '../../redux/actions/announcements';

type Props = {
    icon: string;
    announcement: string;
    warning?: boolean;
    global?: boolean;
    removeBanner: (banner: string, session: boolean) => Promise<void>;
}

const Banner = ({icon, announcement, warning, global, removeBanner}: Props) => {
    return ( <>
        <div className={`banner__wrapper ${warning ? "banner__alert" : ""} ${global ? "banner__global" : ""}`} >
            <div className="banner__left" > 
                <img src={icon} alt="Text icon" className="banner__icon" />
                <div className="banner__text">{announcement}</div>
            </div>
            <div
                className="banner__close"
                onClick={() => {
                    removeBanner(announcement, !global);
                }}
            >GOT IT</div>
        </div>
    </>
    );
}

Banner.defaultProps = {
    warning: false,
    global: false
}

export default connect(null, {removeBanner})(Banner);