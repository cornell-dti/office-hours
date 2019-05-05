import * as React from 'react';

const SelectedTags = (props: {
    tag: string;
    isSelected: boolean;
    onClick: Function | null;
    level: number;
}) => {
    const onClick = () => {
        if (props.onClick) {
            props.onClick();
        }
    };

    return (
        <p
            className={['tag',
                props.level === 1 ? 'primaryTag' : 'secondaryTag',
                props.isSelected && 'selectedTag'].join(' ')}
            onClick={onClick}
        >
            {props.tag}
        </p>
    );
};

export default SelectedTags;
