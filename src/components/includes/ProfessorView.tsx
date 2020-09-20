import * as React from 'react';

import ConfirmationProvider from './Confirmation';

const ProfessorView: React.FunctionComponent = ({children}) => {
    return (
        <ConfirmationProvider>
            <div className="ProfessorView">
                {children}
            </div>
        </ConfirmationProvider>
    );
};

export default ProfessorView;