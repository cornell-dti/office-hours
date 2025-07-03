import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Table } from 'semantic-ui-react';
import { collection, query, where, getCountFromServer, Timestamp, getDocs } from 'firebase/firestore';
import { CURRENT_SEMESTER, START_DATE } from '../../constants';
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

    const [currCoursesCount, setCurrCoursesCount] = useState(0);
    const [currQuestionsCount, setCurrQuestionsCount] = useState(0);
    const [currUsersCount, setCurrUsersCount] = useState(0);
    const [currSessionsCount, setCurrSessionsCount] = useState(0);

    const coursesRef = collection(firestore, 'courses');
    const questionsRef = collection(firestore, 'questions');
    const usersRef = collection(firestore, 'users');
    const sessionsRef = collection(firestore, 'sessions')

    // Firestore Timestamps for the query range
    const startDate = Timestamp.fromDate(new Date(START_DATE));
 
    // Function to fetch counts using getCountFromServer
    const fetchAllCounts = async () => {
        try {
            const [
                coursesSnapshot,
                questionsSnapshot,
                usersSnapshot,
                sessionsSnapshot
            ] = await Promise.all([
                getCountFromServer(coursesRef),
                getCountFromServer(questionsRef),
                getCountFromServer(usersRef),
                getCountFromServer(sessionsRef)
            ]);

            // Update state with the counts
            setCoursesCount(coursesSnapshot.data().count);
            setQuestionsCount(questionsSnapshot.data().count);
            setUsersCount(usersSnapshot.data().count);
            setSessionsCount(sessionsSnapshot.data().count);

        } catch (error) {
            console.error('error fetching all counts: ' + error);
        }
    }

    const fetchCounts = async () => {
        try {
            const currCoursesQuery = query(coursesRef, where('semester', '==', CURRENT_SEMESTER));
            const currSessionsQuery = query(sessionsRef, where('startTime', '>=', startDate));
            const currQuestionsQuery = query(questionsRef, where('timeEntered', '>=',  startDate));
            const userSet = new Set();
    
            (await getDocs(currQuestionsQuery)).docs.map((docu) => {
                if (docu.exists()){
                    userSet.add(docu.get('askerId'));
                    userSet.add(docu.get('answererId'));
                }
            });

            // Fetch document counts for each collection
            const currCoursesSnapshot = await getCountFromServer(currCoursesQuery);
            const currQuestionsSnapshot = await getCountFromServer(currQuestionsQuery);
            const currSessionsSnapshot = await getCountFromServer(currSessionsQuery);
 
            // Update state with the counts
            setCurrCoursesCount(currCoursesSnapshot.data().count);
            setCurrQuestionsCount(currQuestionsSnapshot.data().count);
            setCurrUsersCount(userSet.size);
            setCurrSessionsCount(currSessionsSnapshot.data().count);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error fetching counts:', error);
        }
    };
 
    useEffect(() => {
        fetchAllCounts();
        fetchCounts();  
        // Fetch counts when the component mounts. 
        // Not a realtime listener to avoid constant reads of large collections
    }, []);

    // map storing the stats for ALL semesters
    const historical: { [key: string]: number } = {
        "Courses": coursesCount,
        "Questions": questionsCount,
        "Users": usersCount,
        "Office Hours": sessionsCount,
    };

    // map storing the stats for CURRENT semester
    const current: { [key: string]: number } = {
        "Courses": currCoursesCount,
        "Questions": currQuestionsCount,
        "Users": currUsersCount,
        "Office Hours": currSessionsCount,
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
                                <Table.HeaderCell colSpan='2'>
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
                                <Table.HeaderCell colSpan='2'>
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

