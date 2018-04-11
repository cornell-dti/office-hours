import * as React from 'react';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';

class TASessionView extends React.Component {

    state: {
        sortPopularity: boolean
    };

    constructor(props: {}) {
        super(props);
        this.state = {
            sortPopularity: false
        };
    }

    setSortPop(pop: boolean) {
        this.setState({
            sortPopularity: pop
        });
    }

    render() {
        return (
            <div className="TASessionView">
                <SessionInformationHeader
                    courseName="CS 3110"
                    taName="Michael Clarkson"
                    queueSize={14}
                    date="Wednesday, 8 Nov"
                    time="10:00 AM - 11:00 AM"
                    location="G23 Gates Hall"
                    picture="https://i2.wp.com/puppypassionn.org/wp-content/uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1"
                />
                <SessionQuestionsContainer
                    isDetailed={false}
                    studentPicture={["https://i2.wp.com/puppypassionn.org/wp-content/uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1",
                    "https://i2.wp.com/puppypassionn.org/wp-content/uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1",
                    "https://i2.wp.com/puppypassionn.org/wp-content/uploads/2017/12/img_0881.jpg?resize=256%2C256&ssl=1"]}
                    studentName={['Willie Clarke', 'Nancy Weber', 'Gibbs']}
                    studentQuestion={['How do you implement recursion when you try to use function used in question 4? hard to understand the concept.',
                    'Can you clarify the statistics concept from the prelim?',
                    'How can I use the given function to parse dataset 1?']}
                    userQuestionID={1}
                    tags={[['Assignment', 'Assignment 1', 'Recursion', 'Function'],
                    ['Exam', 'Prelim1', 'Q5', 'Statistics', 'Nearest Neighbor'],
                    ['Lecture', 'Lecture1', 'Parsing', 'DataSet1', 'Function']]}
                    group={[['Joshua Tran', 'Bill Oliver', 'Patrick Gross', 'Harvey Estrada'],
                    ['Joshua Tran', 'Bill Oliver', 'Patrick Gross'],
                    ['Joshua Tran', 'Bill Oliver'], ['Joshua Tran'], []]}
                    order={['NOW', '2nd', '3rd']}
                    times={["10:05 AM", "10:11 AM", "10:18 AM"]}
                    isTA={true}
                />
            </div>
        );
    }
}

export default TASessionView;
