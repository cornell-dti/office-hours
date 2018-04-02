import * as React from 'react';
import ProfessorCalendarTable from '../includes/ProfessorCalendarTable';
import ProfessorAddNewOH from '../includes/ProfessorAddNewOH';
import ProfessorHeader from '../includes/ProfessorHeader';

class ProfessorView extends React.Component {
    render() {
        return (
            <div className="ProfessorView">
                <ProfessorHeader
                    professor='Michael Clarkson'
                    image='https://www.cs.cornell.edu/~clarkson/img/mrc_gates300.jpg'
                    notification={true}
                />
                <div className='main'>
                    <ProfessorAddNewOH
                        taList={['Tiffany Wang', 'Joyelle Gilbert', 'Sophia Wang', 'Sean Kim', 'Zechen Zhang']}
                    />
                    <div className="Calendar">
                        <ProfessorCalendarTable
                            taList={['Tiffany Wang', 'Joyelle Gilbert', 'Sophia Wang', 'Sean Kim', 'Zechen Zhang']}
                            timeStart={[[11100, 202130, 301341340, 10000], [1036530, 235600, 34365300], [1635634500, 276500, 385600, 12312], [104746570, 467200, 30456740], [], [46743100, 200, 300], [100, 200, 300]]}
                            timeEnd={[[120234320, 30134140, 4134565300, 20000], [635, 3635635600, 63653], [4035630, 50770, 6077770, 11111111111], [4847800, 5045670, 608740], [], [4044440, 44444500, 600], [400, 500, 600]]}
                            taIndex={[[0, 1, 3, 4], [0, 2, 1], [0, 2, 1, 3], [2, 1, 0], [], [1, 2, 3], [0, 2, 1]]}
                            LocationBuilding={[['Gates', 'Gates', 'Gates', 'Malott'], ['Upson', 'Upson', 'Duffield'], ['Duffield', 'Phillips', 'Plantations', 'TCAT'],
                            ['Gates', 'Gates', 'Gates'], [], ['Upson', 'Clock Tower', 'Duffield'], ['Duffield', 'Phillips', 'Plantations']]}
                            LocationRoomNum={[['G01', 'G02', 'G03', '122'], ['123', '234', '456'], ['123', '234', '456', 'Route 82'],
                            ['G01', 'G02', 'G03'], [], ['123', '134th Step', '456'], ['123', '234', '456']]}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default ProfessorView;
