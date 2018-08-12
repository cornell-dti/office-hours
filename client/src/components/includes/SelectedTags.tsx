import * as React from 'react';

class SelectedTags extends React.PureComponent {

    props: {
        tag: string,
        isSelected: boolean,
        onClick: Function | null,
        level: number
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
                    this.props.level === 1 ? 'primaryTag' : 'secondaryTag',
                    this.props.isSelected && 'selectedTag'].join(' ')}
                onClick={this._onClick}
            >
                {this.props.tag}
            </p>
        );
    }
}

export default SelectedTags;
