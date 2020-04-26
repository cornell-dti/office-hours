import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import QMeLogo from '../../media/QLogo2.svg';

type Props = {
    show: boolean;
    topTitle: string;
    description: string;
    buttonLabel: string;
    link: string;
    hideFunction: () => void;
};

const Popup = ({ show, topTitle, description, buttonLabel, link, hideFunction }: Props) => {
    const isShown = show ? ' feedback' : '';

    return (
        <>
            <section className={'topPanel' + isShown}>
                <button type="button" className="closeIcon" onClick={() => hideFunction()}>
                    <Icon name="x" />
                </button>
                <img src={QMeLogo} className="QMeLogo" alt="Queue Me In Logo" />
                <h2>{topTitle}</h2>
                <p>{description}</p>
            </section>
            <section className={'bottomPanel' + isShown}>
                <a
                    className="feedbackButton"
                    href={link}
                >
                    {buttonLabel}
                </a>
            </section>
        </>
    );
};

export default Popup;
