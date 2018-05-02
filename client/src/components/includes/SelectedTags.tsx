import * as React from 'react';

class SelectedTags extends React.Component {

    props: {
        index: number,
        tag: string,
        ifSelected: boolean,
        onClick: Function | null,
        level: number
    };

    constructor(props: {}) {
        super(props);
        this._onClick = this._onClick.bind(this);
    }

    _onClick() {
        if (this.props.onClick) {
            this.props.onClick(this.props.index);
        }
    }

    render() {
        var baseClassName = '';
        if (this.props.level === 1) {
            baseClassName = 'tag primaryTag';
        } else if (this.props.level === 2) {
            baseClassName = 'tag secondaryTag';
        }
        if (this.props.ifSelected) {
            return <p className={baseClassName + ' selectedTag'} onClick={this._onClick}>{this.props.tag}</p>;
        } else {
            return <p className={baseClassName} onClick={this._onClick}>{this.props.tag}</p>;
        }
    }
}

export default SelectedTags;
