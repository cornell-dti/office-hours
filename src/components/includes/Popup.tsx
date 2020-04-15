/* eslint-disable @typescript-eslint/indent */

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

class Popup extends React.Component<Props> {
  render() {
    const isShown = this.props.show ? ' feedback' : '';

    return (
      <>
        <section className={'topPanel' + isShown}>
          <button type="button" className="closeIcon" onClick={() => this.props.hideFunction()}>
            <Icon name="x" />
          </button>
          <img src={QMeLogo} className="QMeLogo" alt="Queue Me In Logo" />
          <h2>{this.props.topTitle}</h2>
          <p>{this.props.description}</p>
        </section>
        <section className={'bottomPanel' + isShown}>
          <a
            className="feedbackButton"
            href={this.props.link}
          >
            {this.props.buttonLabel}
          </a>
        </section>
      </>
    );
  }
}

export default Popup;
