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
        const chron = !this.state.sortPopularity;
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
                <div className="SessionSorter">
                    <div
                        className={'SessionSorterItem left ' + (chron ? 'selected' : '')}
                        onClick={() => this.setSortPop(false)}
                    >
                        Chronological
                    </div>
                    <div
                        className={'SessionSorterItem ' + (!chron ? 'selected' : '')}
                        onClick={() => this.setSortPop(true)}
                    >
                        Popularity
                    </div>
                </div>
                <SessionQuestionsContainer
                    isDetailed={false}
                    studentName={['Karun Singh', 'Shefali Agarwal', 'Horace He', 'Tiffany Wang', 'Joyelle Gilbert']}
                    studentQuestion={['How do I start Assignment 1?', 'How do I start Assignment 2?',
                        'How do I start Assignment 3?', 'How do I start Assignment 4?', 'How do I start Assignment 5?']}
                    tags={[['Assignment 1', 'Q4', 'Recursion', 'Conceptual'],
                    ['Assignment 2', 'Q4', 'Recursion', 'Conceptual'],
                    ['Assignment 3', 'Q4', 'Recursion', 'Conceptual'],
                    ['Assignment 4', 'Q4', 'Recursion', 'Conceptual'],
                    ['Assignment 5', 'Q4', 'Recursion', 'Conceptual']]}
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

export default TASessionView;
