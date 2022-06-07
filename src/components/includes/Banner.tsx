import React from 'react';
import {connect} from 'react-redux';
import { updateTextPrompted } from '../../firebasefunctions/phoneNumber';
import { removeBanner } from '../../redux/actions/announcements';
import { RootState } from '../../redux/store';

type Props = {
    icon: string;
    key: number;
    announcement: string;
    warning?: boolean;
    global?: boolean;
    noshow?: boolean;
    removeBanner: (banner: string, session: boolean) => Promise<void>;
    user: FireUser | undefined;
}

const Banner = ({icon, announcement, warning, global, noshow, removeBanner, user, key}: Props) => {
    const dontShow = () => {
        removeBanner(announcement, !global);
        updateTextPrompted(user?.userId);
    }
    return ( <>
        <div 
            key={key} 
            className={`banner__wrapper ${warning ? "banner__alert" : ""} ${global ? "banner__global" : ""}`} 
        >
            <div className="banner__left" > 
                <img src={icon} alt="Text icon" className="banner__icon" />
                <div className="banner__text">{announcement}</div>
            </div>
            <div className="banner__right">
                {noshow && <div className="banner__show" onClick={dontShow}>DON'T SHOW AGAIN</div>}
                <div
                    className="banner__close"
                    onClick={() => {
                        removeBanner(announcement, !global);
                    }}
                >GOT IT</div>
            </div>
        </div>
    </>
    );
}

Banner.defaultProps = {
    warning: false,
    global: false,
    noshow: false
}

const mapStateToProps = (state: RootState) => ({
    user : state.auth.user,
})

export default connect(mapStateToProps, {removeBanner})(Banner);
