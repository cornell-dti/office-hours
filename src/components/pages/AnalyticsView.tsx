import React, { useEffect } from 'react'
import { useHistory } from 'react-router'

import TopBar from '../includes/TopBar';

import { useIsAdmin, useAllCourses, useAllQuestions } from '../../firehooks';

// import { collection, getCountFromServer, getFirestore } from 'firebase/firestore/';

// async function fetchData() {
//   const db = getFirestore();
//   const questionsCol = collection(db, 'questions');

//   try {
//     const snapshot = await getCountFromServer(questionsCol);
//     const totalCount = snapshot.data;
//     console.log("TOTALCOUNT IS: " + totalCount);
//   } catch (error) {
//     console.error(error);
//   }
// }

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
  return (
    <>
      <TopBar
        // In admin view, it is never the case that the Dashboard section should be shown.
        role="student"
        context="professor"
        // This field is only necessary for professors, but we are always student/TA here.
        courseId="DUMMY_COURSE_ID"
      />
      <h3>Analytics</h3>
      courses: {courses.length}
      <br />
      questions: {questions.length}
    </>
  )
}

export default AnalyticsView
