import * as React from 'react';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';
import SessionJoinButton from '../includes/SessionJoinButton';

class StudentSessionView extends React.Component {
    render() {
        var popup = 'PopupInvisible';
        // Moved isDetailed flag to child component, so cannot lock background scroll this way
        // if (this.state.isDetailed) {
        //     popup = 'PopupVisible';
        // }

        return (
            <div className={'StudentSessionView ' + popup}>
                <SessionInformationHeader
                    courseName="CS 1380"
                    taName="Corey Valedz"
                    queueSize={23}
                    date="Wednesday, 8 Nov"
                    time="10:00 AM - 11:00 AM"
                    location="G23 Gates Hall"
                    picture="https://i2.wp.com/puppypassionn.org/wp-content/uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1"
                />
                <SessionJoinButton />
                <SessionQuestionsContainer
                    isDetailed={false}
                    studentName={['Gibbs', 'Dinozzo', 'Ziva']}
                    studentQuestion={['How do you implement recursion when you try to use function used in question 4? hard to understand.',
                    'Can you clarify the statistics concept from the prelim?',
                    'How can I use the given function to parse dataset 1?']}
                    tags={[['Assignment', 'Assignment 1', 'Recursion', 'Function'],
                    ['Exam', 'Prelim1', 'Q5', 'Statistics', 'Nearest Neighbor'],
                    ['Lecture', 'Lecture1', 'Parsing', 'DataSet1', 'Function']]}
                    group={[['Joshua Tran', 'Bill Oliver', 'Patrick Gross', 'Harvey Estrada'],
                    ['Joshua Tran', 'Bill Oliver', 'Patrick Gross'],
                    ['Joshua Tran', 'Bill Oliver'], ['Joshua Tran'], []]}
                    order={['NOW', '2nd', '3rd']}
                    times={["10:05 AM", "10:11 AM", "10:18 AM"]}
                />
            </div>
        );
    }
}

export default StudentSessionView;
