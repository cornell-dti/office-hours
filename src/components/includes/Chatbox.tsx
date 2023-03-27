import React, { useEffect, useState } from 'react';

import {connect} from 'react-redux'
import '../../styles/Chatbox.scss';
import SendIcon from '../../media/send-icon.png';
import Dropdown from '../../media/chevron-down.svg';
import ChatMessage from './ChatMessage';

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

type Message = {
    message: string;
    user: boolean;
    name: string;
    session: string;
    timeSent: string;
}

const Chatbox = (props: Props) => {
    const [showChat, setShowChat] = useState(false);
    const [image, setImage] = useState(props.user ? props.user.photoUrl : '/placeholder.png');

    const userPhotoUrl = props.user ? props.user.photoUrl : '/placeholder.png';
    useEffect(() => setImage(userPhotoUrl), [userPhotoUrl]); 

    const user = props.user;
    const email: string | undefined = user?.email



    const [input, setInput] = useState("")
    const [chatMessages, setChatMessages] = useState<string[]>([])


    const handleKeyDown = (event: any) => {
      if (event.key === 'Enter' && input != "") {
        sendMessage();
        setChatMessages( (x) => chatMessages.concat(input) )
      }
    }

    const sendMessage = () => {
    //   messages.push(input)
    //   setInput("")
    }

    var message1 : Message = {
        message: "this is the first message you sent",
        user: true,
        name: "Lily Pham",
        session: "",
        timeSent: ""
    }

    var message2 : Message = {
        message: "this was sent by someone else",
        user: false,
        name: "John Doe",
        session: "",
        timeSent: ""
    }

    var message3 : Message = {
        message: "this very very very very super long message was sent by someone else but not sure if it will overflow",
        user: false,
        name: "John Doe",
        session: "",
        timeSent: ""
    }

    const messages = [message1, message2, message3, message3]

    return (
        <div className="ChatBox" onBlur={() => setShowChat(false)}>
            <div className="ChatBoxTop">
                <header className="ChatBoxTopText">CS 1110 Queue Chat</header>
                <img className="dropdownIcon" src={Dropdown} alt="" />
            </div>
            <div className="chatMessages">
                {/* {chatMessages && chatMessages.map(msg => <ChatMessage msg={msg} sentBySelf={true}/>)} */}
                {messages && messages.map(msg => <ChatMessage 
                    msg={msg.message} 
                    sentBySelf={msg.user}
                    name={msg.name}
                />)}
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