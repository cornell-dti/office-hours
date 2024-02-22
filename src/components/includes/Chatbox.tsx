import React, { useEffect, useState } from 'react';
import {connect} from 'react-redux'
import { firestore } from '../../firebase';
import firebase from 'firebase/app';
import { RootState } from '../../redux/store';
import datatime from 'react';

import { getAllMessages, getSessionMessages } from '../../firebasefunctions/chatmessages';
import ChatMessage from './ChatMessage';
import ChatIcon from '../../media/chat-icon.svg'
import SendIcon from '../../media/send_icon.svg'
import Dropdown from '../../media/chevron-down.svg';

export type Props = {
    courseId: string;
    user: FireUser | undefined;
    role: FireCourseRole;
    context: string;
    course?: FireCourse;
    session?: FireSession;
    admin?: boolean;
    snackbars: Announcement[];
}

export type Message = {
    message: string;
    userId: string;
    name: string;
    sessionId: string;
    timeSent: string;
}

const Chatbox = (props: Props) => {
    // var message1 : Message = {
    //     message: "this is the first message you sent",
    //     userId: 'props.user',
    //     name: "Lily Pham",
    //     sessionId: 'props.session',
    //     timeSent: ""
    // }
    
    const [showChat, setShowChat] = useState(false);
    const [image, setImage] = useState(props.user ? props.user.photoUrl : '/placeholder.png');
    const user = props.user;
    const userPhotoUrl = props.user ? props.user.photoUrl : '/placeholder.png';
    const [chatMessages, setChatMessages] = useState<Message[]>([])
    var name: string | undefined = user?.firstName + ' ' + user?.lastName

    useEffect(() => {
        // setImage(userPhotoUrl), [userPhotoUrl];
        getAllMessages().then(messages => {
            setChatMessages(messages);
        });
    }); 

    const [input, setInput] = useState("")
    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter' && input != "") {
          sendMessage();
          setChatMessages( (x) => chatMessages ? chatMessages : [])
        }
      }
  
      const sendMessage = async () => {
        var newMessage = {
                message: input,
                userId: props.user?.userId,
                name: props.user?.firstName + ' ' + props.user?.lastName,
                session: props.session?.sessionId,
                timeSent: "time holder",
            }
        const messagesRef = firestore.collection('chatmessages');
        await messagesRef.add(newMessage);
        setInput("")
      }
    

    return (
        !showChat ? 
        <img className='chatIcon' src={ChatIcon} onClick={() => setShowChat(true)}/>
        :
        <div className="ChatBox">
            <div className="ChatBoxTop">
                <header className="ChatBoxTopText">CS 1110 Queue Chat</header>
                <img className="dropdownIcon" src={Dropdown} onClick={() => setShowChat(false)} />
            </div>
            <div className="chatMessages">
                {
                chatMessages && chatMessages.map(msg => <ChatMessage 
                    msg={msg.message} 
                    sentBySelf={msg.userId == props.user?.userId}
                    name={msg.name}
                />)}
            </div>
            <div className="send">
                <img className="sendIcon" src={SendIcon} alt="" onClick={sendMessage} />
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