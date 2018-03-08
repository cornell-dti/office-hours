import * as React from 'react';
import SessionInformationHeader from '../includes/SessionInformationHeader';
import SessionQuestionsContainer from '../includes/SessionQuestionsContainer';
import SessionPopularQuestionsContainer from '../includes/SessionPopularQuestionsContainer';
import SessionJoinButton from '../includes/SessionJoinButton';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { ChildProps } from 'react-apollo';

const QUERY = gql`{
    allQuestions{
        nodes {
            value
        }
    }
}`;

const withData = graphql<Response>(QUERY, {});

class StudentSessionView extends React.Component<ChildProps<{}, Response>, {}> {
    render() {
        console.log(this.props.data);
        var popup = 'PopupInvisible';
        // Moved isDetailed flag to child component, so cannot lock background scroll this way
        // if (this.state.isDetailed) {
        //     popup = 'PopupVisible';
        // }

        return (
            <div className={'StudentSessionView ' + popup}>
                <SessionInformationHeader
                    courseName="CS 3110"
                    taName="Michael Clarkson"
                    queueSize={14}
                    date="Wednesday, 8 Nov"
                    time="10:00 AM - 11:00 AM"
                    location="G23 Gates Hall"
                />
                <SessionPopularQuestionsContainer />
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
                    numberOfPeople={[10, 20, 30, 40, 50]}
                />
                <SessionJoinButton />
            </div>
        );
    }
}

export default withData(StudentSessionView);
