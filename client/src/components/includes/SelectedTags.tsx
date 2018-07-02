import * as React from 'react';

class SelectedTags extends React.Component {

    props: {
        index: number,
        tag: string,
        isSelected: boolean,
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
        return (
            <p
                className={'tag ' +
                    (this.props.level === 1) ? 'primaryTag' : 'secondaryTag' +
                    this.props.isSelected && ' selectedTag'}
                onClick={this._onClick}
            >
                {this.props.tag}
            </p>
        );
    }
}

export default SelectedTags;
