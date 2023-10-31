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

  const startDate: Date = new Date('2023-08-01');
  const endDate: Date = new Date('2023-12-31');

  const currCourses = courses.filter(course => course.semester === 'FA23');
  const currQuestions = questions.filter(question => {
    const dateEntered: Date = question.timeEntered.toDate();
    return dateEntered >= startDate && dateEntered <= endDate;
  });
  const currUsers = users.filter(user => {
    return Array.isArray(user.courses) && user.courses.some(course => course.includes('fa-23'));
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
