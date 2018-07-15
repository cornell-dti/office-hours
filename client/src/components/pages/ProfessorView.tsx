import * as React from 'react';
import ProfessorCalendarTable from '../includes/ProfessorCalendarTable';
import ProfessorAddNewOH from '../includes/ProfessorAddNewOH';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import CalendarWeekSelect from '../includes/CalendarWeekSelect';

class ProfessorView extends React.Component {
    render() {
        return (
            <div className="ProfessorView">
                <ProfessorSidebar
                    course="CS 1380"
                />
                <div className="rightOfSidebar">
                    <TopBar
                        user={{
                            firstName: 'Michael',
                            lastName: 'Clarkson',
                            photoUrl: 'https://www.cs.cornell.edu/~clarkson/img/mrc_gates300.jpg',
                            userId: -1
                        }}
                    />
                    <div className="main">
                        <ProfessorAddNewOH
                            taList={['Tiffany Wang', 'Joyelle Gilbert', 'Sophia Wang', 'Sean Kim', 'Zechen Zhang']}
                        />
                        <CalendarWeekSelect />
                        <div className="Calendar">
                            <ProfessorCalendarTable
                                taList={['Tiffany Wang', 'Joyelle Gilbert', 'Sophia Wang', 'Sean Kim', 'Zechen Zhang']}
                                timeStart={
                                    [[1522684800000, 1522688400000, 1522695600000, 1522713600000],
                                    [1522764000000, 1522764000000, 1522789200000],
                                    [1522846800000, 1522850400000, 1522868400000, 1522872000000],
                                    [1522965600000, 1522965600000, 1522940400000], [],
                                    [1523120400000, 1523124000000, 1523134800000],
                                    [1523188800000, 1523199600000, 1523217600000]]
                                }
                                timeEnd={
                                    [[1522688400000, 1522692000000, 1522699200000, 1522717200000],
                                    [1522767600000, 1522767600000, 1522792800000],
                                    [1522854000000, 1522854000000, 1522872000000, 1522875600000],
                                    [1522969200000, 1522969200000, 1522990800000], [],
                                    [1523127600000, 1523131200000, 1523145600000],
                                    [1523192400000, 1523206800000, 1523228400000]]
                                }
                                taIndex={[[0, 1, 3, 4], [0, 2, 1], [0, 2, 1, 3], [2, 1, 0], [], [1, 2, 3], [0, 2, 1]]}
                                LocationBuilding={
                                    [['Gates', 'Gates', 'Gates', 'Malott'], ['Upson', 'Upson', 'Duffield'],
                                    ['Duffield', 'Phillips', 'Plantations', 'TCAT'], ['Gates', 'Gates', 'Gates'],
                                    [], ['Upson', 'Clock Tower', 'Duffield'], ['Duffield', 'Phillips', 'Plantations']]
                                }
                                LocationRoomNum={
                                    [['G01', 'G02', 'G03', '122'], ['123', '234', '456'],
                                    ['123', '234', '456', 'Route 82'], ['G01', 'G02', 'G03'], [],
                                    ['123', '134th Step', '456'], ['123', '234', '456']]
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProfessorView;
