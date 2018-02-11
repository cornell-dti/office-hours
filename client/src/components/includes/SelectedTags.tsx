import * as React from 'react';
import '../../styles/QuestionHeader.css';

class SelectedTags extends React.Component {

  props: {
      index: number,
      tag: string,
      ifSelected: boolean,
      onClick: Function
  };

  constructor(props: {}) {
      super(props);
      this._onClick = this._onClick.bind(this);
  }

  _onClick() {
    this.props.onClick(this.props.index);
  }

  render() {
      if (this.props.ifSelected) return <p className="selectedTag" onClick={this._onClick}>this.props.tag</p>;
      else return <p onClick={this._onClick}>this.props.tag</p>;
  }
}

export default SelectedTags;
