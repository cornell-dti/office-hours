import React from 'react';
import { onEnterOrSpace } from '../../utilities/a11y';

const DropDownEntry: React.FC<{
    onSelect: () => void;
}> = ({ onSelect, children }) => {
    return (<li>
        <div
            role="button" 
            tabIndex={0}
            onMouseDown={(event) => event.preventDefault()}
            onKeyPress={onEnterOrSpace(onSelect)}
            onClick={() => onSelect()}           
        >
            {children}
        </div>
    </li>);
};

export default DropDownEntry;