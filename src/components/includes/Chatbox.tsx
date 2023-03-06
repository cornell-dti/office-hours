import React, { useEffect, useState } from 'react';

import {connect} from 'react-redux'
import '../../../src/styles/Chatbox.scss';
import SendIcon from '../../media/send-icon.png';
import Dropdown from '../../media/chevron-down.svg';
import { firestore } from '../../firebase';
import ChatMessage from './ChatMessage';

import {useNotificationTracker} from '../../firehooks';
import { RootState } from '../../redux/store';


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
    session?: FireSession;
    admin?: boolean;
    snackbars: Announcement[];
}

const Chatbox = (props: Props) => {
    const [showChat, setShowChat] = useState(false);
    const [image, setImage] = useState(props.user ? props.user.photoUrl : '/placeholder.png');

    const user = props.user;
    const email: string | undefined = user?.email


    const [input, setInput] = useState("")
    const [chatMessages, setChatMessages] = useState<String[]>()


    const handleKeyDown = (event: any) => {
      if (event.key === 'Enter') {
        sendMessage();
        setChatMessages( (x) => chatMessages ? chatMessages.concat(input) : [])
      }
    }

    const sendMessage = () => {
      messages.push(input)
      setInput("")
    }

    const messages = ["test1","test2"]

    return (
        <div className="ChatBox" onBlur={() => setShowChat(false)}>
          <div className="ChatBoxTop">
            <header className="ChatBoxTopText">CS 1110 Queue Chat</header>
            <img className="dropdownIcon" src={Dropdown} alt="" />
          </div>
          <div className="chatMessages">
            {chatMessages && chatMessages.map(msg => <ChatMessage msg={msg}/>)}
          </div>
          <div className="send">
            <img className="sendIcon" src={SendIcon} alt="" onClick={sendMessage}/>
              <input
                className="TextBox" 
                value={input}
                type="text" 
                placeholder="Type something..." 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown} 
              />
          </div>
        </div>
    );
};

Chatbox.defaultProps = {
    course: undefined,
    admin: false,
};

const mapStateToProps = (state: RootState) => ({
    user : state.auth.user,
    snackbars : state.announcements.snackbars
})


export default connect(mapStateToProps, {})(Chatbox);