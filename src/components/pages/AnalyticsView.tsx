import React, { useEffect } from 'react'
import { useHistory } from 'react-router'

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

  let startMonth, endMonth;
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

  return (
    <>
      <TopBar
        // In admin view, it is never the case that the Dashboard section should be shown.
        role="student"
        context="professor"
        // This field is only necessary for professors, but we are always student/TA here.
        courseId="DUMMY_COURSE_ID"
      />
      <h2>Analytics</h2>
      <h3>Historical</h3>
      courses: {courses.length}
      <br />
      questions: {questions.length}
      <br />
      users: {users.length}
      <br />
      sessions: {sessions.length}
      <br />
      <h3>Current Semester</h3>
      courses: {currCourses.length}
      <br />
      questions: {currQuestions.length}
      <br />
      users: {currUsers.length}
      <br />
      sessions: {currSessions.length}
      <br />
    </>
  )
}

export default AnalyticsView
