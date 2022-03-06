import React, {Dispatch, SetStateAction, useEffect} from 'react';
import bannerIcon from '../../media/bannerIcon.svg'

type Props = {
    announcement: string;
    showBanner: boolean;
    setShowBanner: Dispatch<SetStateAction<boolean>>;
    setBannerText: Dispatch<SetStateAction<string>>;
}

const Banner = ({announcement, showBanner, setShowBanner, setBannerText}: Props) => {
    useEffect(() => {
    
    }, [showBanner])
    return ( <>{showBanner && (
        <div className="banner__wrapper" >
            <div className="banner__left" > 
                <img src={bannerIcon} alt="Text icon" className="banner__icon" />
                <div className="banner__text">{announcement}</div>
            </div>
            <div
                className="banner__close"
                onClick={() => {
                    setShowBanner(false);
                    setBannerText("");
                }}
            >GOT IT</div>
        </div>
    )}
    </>
    );
}


export default Banner;