import * as React from 'react';
import { Icon } from 'semantic-ui-react';
const QMeLogo = require('../../media/QLogo2.svg');

class Popup extends React.Component {
  props: {
    show: boolean,
    topTitle: string,
    description: string,
    buttonLabel: string,
    link: string,
    hideFunction: () => void
  };
  render() {
    let isShown = this.props.show ? ' contact' : '';

    return (
      <React.Fragment>
          <section className={'topPanel' + isShown}>
              <button className="x" onClick={() => this.props.hideFunction()}>
                  <Icon name="x" />
              </button>
              <img src={QMeLogo} className="QMeLogo" />
              <h2>{this.props.topTitle}</h2>
              <p>{this.props.description}</p>
          </section>
          <section className={'bottomPanel' + isShown}>
              <a
                  className="contactButton"
                  href={this.props.link}
              >
                  {this.props.buttonLabel}
              </a>
          </section>
      </React.Fragment>
    );
  }
}

export default Popup;
