import React, { useEffect, useState } from 'react';

import {connect} from 'react-redux'
import addNotification from 'react-push-notification';
import { Icon } from 'semantic-ui-react';
import { logOut } from '../../firebasefunctions/user';
import Logo from '../../media/QLogo2.svg';
import CalendarHeader from './CalendarHeader';
import ProfessorStudentToggle from './ProfessorStudentToggle';
import TopBarNotifications from './TopBarNotifications'
import {useNotificationTracker} from '../../firehooks';
import { RootState } from '../../redux/store';
import { updateLastSent } from '../../firebasefunctions/notifications';
import Snackbar from "./Snackbar"
import TextNotificationModal from './TextNotificationModal';

type Props = {
  courseId: string;
  user: FireUser | undefined;
  // A user's role: student, ta, or professor
  // We show TA's and Profs extra links
  role: FireCourseRole;
  // Whether we're in a "professor" view or "student" view
  // controls where "switch view" goes
  context: string;
  course?: FireCourse;
  admin?: boolean;
  snackbars: Announcement[];
}

const ChatBox = (props: Props) => {
  return (
      <h1>Test</h1>
    )
}

ChatBox.defaultProps = {
  course: undefined,
  admin: false,
};

const mapStateToProps = (state: RootState) => ({
  user : state.auth.user,
  snackbars : state.announcements.snackbars
})


export default connect(mapStateToProps, {})(ChatBox);