import React, { Dispatch, SetStateAction } from 'react';
import { Icon } from 'semantic-ui-react';
import arrow from '../../media/arrow.svg';
import smallPlus from '../../media/plus.svg';
import bigPlus from '../../media/plus2.svg';
import "../../styles/wrapped/WrappedAnimation.scss";

type Props = {
    showWrappedModal: boolean;
    setShowWrappedModal: Dispatch<SetStateAction<boolean>>;
};

const WrappedAnimationModal = ({
    showWrappedModal,
    setShowWrappedModal
}: Props) => {
    const isShown = showWrappedModal ? 'Visible' : '';

    const closeModal = () => {
        setShowWrappedModal(false);
    };


    return (
        <>
            {showWrappedModal && (
                <div className='WrappedModalScreen'>
                    <div className={'WrappedModal' + isShown}>
                        <button type='button' className='closeButton' onClick={closeModal}>
                            <Icon name='x' />
                        </button>
                        <div className='qmi-container'>
                            {/* creates first red svg circle. need linear gradient tags here 
          since didn't import this svg.
          make note that width and height are basically the box containing the circle,
          so they need to be double the radius
          */}
                            <svg className="red-circle" width="300" height="300">
                                {/* this creates the color gradients on the qmi logo */}
                                <linearGradient id="red-gradient" x1="24.4251" y1="-52.6352" x2="112.279" y2="143.659" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#FF9399" />
                                    <stop offset="1" stopColor="#FF5A60" />
                                </linearGradient>
                                {/* this is the actual circle part. cx and cy are centers so shld be half of height/width. r is radius */}
                                <circle cx='150' cy='150' r='115'> </circle>
                            </svg>
                            <svg className="blue-circle" width="400" height="400">
                                <defs>
                                    <linearGradient id="blue-gradient" x1="36.7649" y1="66.8832" x2="134.326" y2="192.278" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#B2D9FF" />
                                        <stop offset="1" stopColor="#78B6F4" />
                                    </linearGradient>
                                </defs>
                                <circle cx='200' cy='200' r='180'> </circle>
                            </svg>
                            {/* imported way of using svgs, so cant adjust stroke colors */}
                            <img src={arrow} className="arrow-circle" alt="dti arrow" />
                            {/* made two pluses since color gradient changes and second one needs
           to expand outside of the container. */}
                            <img src={smallPlus} className="first-plus" alt="first plus" />
                            <img src={bigPlus} className="sec-plus" alt="second plus" />
                        </div>
                    </div>
                </div>)
            }
        </>

    );
};

export default WrappedAnimationModal;
