import * as React from 'react';
import ProfessorCalendarTable from '../includes/ProfessorCalendarTable';
import ProfessorAddNewOH from '../includes/ProfessorAddNewOH';

class ProfessorView extends React.Component {
    render() {
        return (
            <div className="ProfessorView">
                <ProfessorAddNewOH
                    taList={["Tiffany Wang", "Joyelle Gilbert", "Sophia Wang"]}
                />
                <div className="Calendar">
                    <ProfessorCalendarTable
                        taList={["Tiffany Wang", "Joyelle Gilbert", "Sophia Wang"]}
                        mondayList={[['11:00 AM to 12:00 PM', '12:00 PM to 2:00 PM'], ['Zechen Zhang', 'Bob'], ['Gates Hall G01', 'Gates Hall G21']]}
                        tuesdayList={[['11:00 AM to 12:00 PM', '12:00 PM to 2:00 PM'], ['Zechen Zhang', 'Bob'], ['Gates Hall G01', 'Gates Hall G21']]}
                        wednesdayList={[['11:00 AM to 12:00 PM', '12:00 PM to 2:00 PM'], ['Zechen Zhang', 'Bob'], ['Gates Hall G01', 'Gates Hall G21']]}
                        thursdayList={[['11:00 AM to 12:00 PM', '12:00 PM to 2:00 PM'], ['Zechen Zhang', 'Bob'], ['Gates Hall G01', 'Gates Hall G21']]}
                        fridayList={[[], [], []]} // Empty
                        saturdayList={[['11:00 AM to 12:00 PM', '12:00 PM to 2:00 PM'], ['Zechen Zhang', 'Bob'], ['Gates Hall G01', 'Gates Hall G21']]}
                        sundayList={[['11:00 AM to 12:00 PM', '12:00 PM to 2:00 PM'], ['Zechen Zhang', 'Bob'], ['Gates Hall G01', 'Gates Hall G21']]}
                    />
                </div>
            </div>
        );
    }
}

export default ProfessorView;
