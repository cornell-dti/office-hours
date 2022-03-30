import React from 'react';

type Props = {
    icon: string;
    announcement: string;
}

const Snackbar = ({icon, announcement}: Props) => {
    return ( <>
        <div className="snackbar__wrapper" >
            <img src={icon} alt="Snackbar icon" className="snackbar__icon" />
            <div className="snackbar__text">{announcement}</div>
        </div>
    </>
    );
}


export default Snackbar;