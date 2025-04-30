// import React, { useEffect } from 'react'
// import { useHistory } from 'react-router'
// import { Table } from 'semantic-ui-react';
// import { collection, query, orderBy } from 'firebase/firestore';
// import { useIsAdmin, useQuery} from '../../firehooks';
// import { firestore } from '../../firebase';

// const AnalyticsView = () => {
//     const history = useHistory();
//     const isAdmin = useIsAdmin();
    
//     useEffect(() => {
//         if (isAdmin === undefined) {
//             history.push('/')
//         }
//     }, [isAdmin, history]);

//     // queries for all semesters
//     const courses = useQuery<FireCourse>(
//         'all',
//         () => query(
//             collection(firestore, 'courses'),
//             orderBy('semester', 'desc')
//         ),
//         'courseId'
//     );

//     const questions = useQuery<FireQuestion>(
//         'all',
//         () => query(
//             collection(firestore, 'questions'),
//             orderBy('timeEntered', 'desc')
//         ),
//         'questionId'
//     );

//     const users = useQuery<FireUser>(
//         'all',
//         () => query(
//             collection(firestore, 'users'),
//             orderBy('lastActive', 'desc')
//         ),
//         'userId'
//     );

//     const sessions = useQuery<FireSession>(
//         'all',
//         () => query(
//             collection(firestore, 'sessions'),
//             orderBy('startTime', 'desc')
//         ),
//         'sessionId'
//     );

//     // use time to filter for current semester
//     const currDate = new Date();
//     const currSem = currDate.getMonth() >= 8 && currDate.getMonth() < 13 ? 'FA' : 'SP';
//     const currYearTwo = currDate.getFullYear() % 100;

//     let startMonth;
//     let endMonth;
//     if (currDate.getMonth() >= 7) {
//         startMonth = 7; // August
//         endMonth = 11;  // December
//     } else {
//         startMonth = 0; // January
//         endMonth = 6;  // July
//     }
    
//     // Fall is Aug 01-Dec 31, Spring is Jan 01-July 31
//     const startDate = new Date(currDate.getFullYear(), startMonth, 1);
//     const endDate = new Date(currDate.getFullYear(), endMonth, 31);

//     const currCourses = courses.filter(course => course.semester === (currSem + currYearTwo)); // e.g. FA23
//     const currQuestions = questions.filter(question => {
//         const dateEntered: Date = question.timeEntered.toDate();
//         return dateEntered >= startDate && dateEntered <= endDate;
//     });
//     const currUsers = users.filter(user => {
//         return Array.isArray(user.courses) && user.courses.some(course =>
//             course.includes(currSem.toLowerCase() + "-" + currYearTwo)); // e.g. fa-23
//     });
//     const currSessions = sessions.filter(session => {
//         const dateEntered: Date = session.startTime.toDate();
//         return dateEntered >= startDate && dateEntered <= endDate;
//     });

//     // map storing the stats for ALL semesters
//     const historical: { [key: string]: any } = {
//         "Courses": courses.length,
//         "Questions": questions.length,
//         "Users": users.length,
//         "Office Hours": sessions.length,
//     }
//     // map storing the stats for CURRENT semester
//     const current: { [key: string]: any } = {
//         "Courses": currCourses.length,
//         "Questions": currQuestions.length,
//         "Users": currUsers.length,
//         "Office Hours": currSessions.length,
//     }
//     return (
//         <>

//             <div
//                 style={{
//                     display: 'flex',
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     margin: '0px 200px',
//                     gap: '50px'
//                 }}
//             >
//                 <div className="rolesTable">
//                     {<Table sortable={true} celled={true} fixed={true} textAlign={'center'}>
//                         <Table.Header>
//                             <Table.Row>
//                                 <Table.HeaderCell colspan='2'>
//                                     All Semesters
//                                 </Table.HeaderCell>
//                             </Table.Row>
//                         </Table.Header>
//                         <Table.Header>
//                             <Table.Row>
//                                 <Table.HeaderCell>
//                                     Statistic
//                                 </Table.HeaderCell>
//                                 <Table.HeaderCell>
//                                     Count
//                                 </Table.HeaderCell>
//                             </Table.Row>
//                         </Table.Header>
//                         {Object.keys(historical).map((stat) => (
//                             <Table.Row key={stat}>
//                                 <Table.Cell>{stat}</Table.Cell>
//                                 <Table.Cell>{historical[stat]}</Table.Cell>
//                             </Table.Row>
//                         ))}
//                     </Table>}
//                 </div>

//                 <div className="rolesTable">
//                     {<Table sortable={true} celled={true} fixed={true} textAlign={'center'}>
//                         <Table.Header>
//                             <Table.Row>
//                                 <Table.HeaderCell colspan='2'>
//                                     Current Semester ({currSem}{currYearTwo})
//                                 </Table.HeaderCell>
//                             </Table.Row>
//                         </Table.Header>
//                         <Table.Header>
//                             <Table.Row>
//                                 <Table.HeaderCell>
//                                     Statistic
//                                 </Table.HeaderCell>
//                                 <Table.HeaderCell>
//                                     Count
//                                 </Table.HeaderCell>
//                             </Table.Row>
//                         </Table.Header>
//                         {Object.keys(current).map((stat) => (
//                             <Table.Row key={stat}>
//                                 <Table.Cell>{stat}</Table.Cell>
//                                 <Table.Cell>{current[stat]}</Table.Cell>
//                             </Table.Row>
//                         ))}
//                     </Table>}
//                 </div>
//             </div >
//         </>
//     )
// }

// export default AnalyticsView

import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Table } from 'semantic-ui-react';
import { CURRENT_SEMESTER } from '../../constants';
import { collection, query, orderBy, onSnapshot, getCountFromServer } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { useIsAdmin } from '../../firehooks';

const AnalyticsView = () => {
    const history = useHistory();
    const isAdmin = useIsAdmin();
    
    useEffect(() => {
        if (isAdmin === undefined) {
            history.push('/')
        }
    }, [isAdmin, history]);

     // State to store document counts
     const [coursesCount, setCoursesCount] = useState(0);
     const [questionsCount, setQuestionsCount] = useState(0);
     const [usersCount, setUsersCount] = useState(0);
     const [sessionsCount, setSessionsCount] = useState(0);
 
     // Function to fetch counts using getCountFromServer
     const fetchCounts = async () => {
         try {
             const coursesQuery = query(collection(firestore, 'courses'), orderBy('semester', 'desc'));
             const questionsQuery = query(collection(firestore, 'questions'), orderBy('timeEntered', 'desc'));
             const usersQuery = query(collection(firestore, 'users'), orderBy('lastActive', 'desc'));
             const sessionsQuery = query(collection(firestore, 'sessions'), orderBy('startTime', 'desc'));
 
             // Fetch document counts for each collection
             const coursesSnapshot = await getCountFromServer(coursesQuery);
             const questionsSnapshot = await getCountFromServer(questionsQuery);
             const usersSnapshot = await getCountFromServer(usersQuery);
             const sessionsSnapshot = await getCountFromServer(sessionsQuery);
 
             // Update state with the counts
             setCoursesCount(coursesSnapshot.data().count);
             setQuestionsCount(questionsSnapshot.data().count);
             setUsersCount(usersSnapshot.data().count);
             setSessionsCount(sessionsSnapshot.data().count);
         } catch (error) {
             console.error('Error fetching counts:', error);
         }
     };
 
     useEffect(() => {
         fetchCounts();  // Fetch counts when the component mounts
     }, []);

     // map storing the stats for ALL semesters
    const historical: { [key: string]: any } = {
        "Courses": coursesCount,
        "Questions": questionsCount,
        "Users": usersCount,
        "Office Hours": sessionsCount,
    };

    // map storing the stats for CURRENT semester
    const current: { [key: string]: any } = {
        "Courses": 0,
        "Questions": 0,
        "Users": 0,
        "Office Hours": 0,
    };

    return (
        <>
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
                    <Table sortable={true} celled={true} fixed={true} textAlign={'center'}>
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
                    </Table>
                </div>

                <div className="rolesTable">
                    <Table sortable={true} celled={true} fixed={true} textAlign={'center'}>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell colspan='2'>
                                    Current Semester ({CURRENT_SEMESTER})
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
                    </Table>
                </div>
            </div>
        </>
    );
};

export default AnalyticsView;

