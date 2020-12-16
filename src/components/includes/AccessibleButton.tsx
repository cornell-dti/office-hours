import React from 'react';

import { onEnterOrSpace } from "../../utilities/a11y";

const AccessibleButton: React.FC<{
    onInteract: () => void;
    className?: string;
}> = ({onInteract, className = "", children}) => 
    (<div
        role="button"
        className={className}
        onClick={onInteract}
        onKeyPress={onEnterOrSpace(onInteract)}
        tabIndex={0}
    >{children}</div>);

export default AccessibleButton;