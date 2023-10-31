import React, { useEffect } from 'react'
import { useHistory } from 'react-router'
import { Table } from 'semantic-ui-react';

import TopBar from '../includes/TopBar';

import { useIsAdmin, useAllCourses, useAllQuestions, useAllUsers, useAllSessions } from '../../firehooks';

const AnalyticsView = () => {
    const history = useHistory();
    const isAdmin = useIsAdmin();
    useEffect(() => {
        if (isAdmin === undefined) {
            history.push('/')
        }
    }, [isAdmin, history]);

    const courses = useAllCourses();
    const questions = useAllQuestions();
    const users = useAllUsers();
    const sessions = useAllSessions();

    const currDate: Date = new Date();
    const currSem = currDate.getMonth() >= 8 && currDate.getMonth() < 13 ? 'FA' : 'SP';
    const currYearTwo = currDate.getFullYear() % 100;

    let startMonth;
    let endMonth;
    if (currDate.getMonth() >= 7) {
        startMonth = 7; // August
        endMonth = 11;  // December
    } else {
        startMonth = 0; // January
        endMonth = 6;  // July
    }

    const startDate = new Date(currDate.getFullYear(), startMonth, 1);
    const endDate = new Date(currDate.getFullYear(), endMonth, 31);

    const currCourses = courses.filter(course => course.semester === (currSem + currYearTwo)); // e.g. FA23
    const currQuestions = questions.filter(question => {
        const dateEntered: Date = question.timeEntered.toDate();
        return dateEntered >= startDate && dateEntered <= endDate;
    });
    const currUsers = users.filter(user => {
        return Array.isArray(user.courses) && user.courses.some(course =>
            course.includes(currSem.toLowerCase() + "-" + currYearTwo)); // e.g. fa-23
    });
    const currSessions = sessions.filter(session => {
        const dateEntered: Date = session.startTime.toDate();
        return dateEntered >= startDate && dateEntered <= endDate;
    });

    const historical: { [key: string]: any } = {
        "Courses": courses.length,
        "Questions": questions.length,
        "Users": users.length,
        "Office Hours": sessions.length,
    }
    const current: { [key: string]: any } = {
        "Courses": currCourses.length,
        "Questions": currQuestions.length,
        "Users": currUsers.length,
        "Office Hours": currSessions.length,
    }
    return (
        <>
            <TopBar
                // In admin view, it is never the case that the Dashboard section should be shown.
                role="student"
                context="professor"
                // This field is only necessary for professors, but we are always student/TA here.
                courseId="DUMMY_COURSE_ID"
            />
            <h1><br />Queue Me In Product Analytics</h1>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0px 200px',
                    gap: '50px'
                }}
            >
                <div className="rolesTable">
                    {<Table sortable={true} celled={true} fixed={true} textAlign={'center'}>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell colspan='2'>
                                    All Semesters
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                    Statistic
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    Count
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        {Object.keys(historical).map((stat) => (
                            <Table.Row key={stat}>
                                <Table.Cell>{stat}</Table.Cell>
                                <Table.Cell>{historical[stat]}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table>}
                </div>

                <div className="rolesTable">
                    {<Table sortable={true} celled={true} fixed={true} textAlign={'center'}>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell colspan='2'>
                                    Current Semester ({currSem}{currYearTwo})
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                    Statistic
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    Count
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        {Object.keys(current).map((stat) => (
                            <Table.Row key={stat}>
                                <Table.Cell>{stat}</Table.Cell>
                                <Table.Cell>{current[stat]}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table>}
                </div>
            </div >
        </>
    )
}

export default AnalyticsView
