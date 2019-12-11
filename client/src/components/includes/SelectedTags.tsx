import * as React from 'react';

class SelectedTags extends React.PureComponent {
    props!: {
        tag: FireTag,
        isSelected: boolean,
        onClick?: Function,
    };

    _onClick = () => {
        if (this.props.onClick) {
            this.props.onClick();
        }
    }

    render() {
        return (
            <p
                className={['tag',
                    this.props.tag.level === 1 ? 'primaryTag' : 'secondaryTag',
                    this.props.isSelected && 'selectedTag'].join(' ')}
                onClick={this._onClick}
            >
                {this.props.tag.name}
            </p>
        );
    }
}

export default SelectedTags;
