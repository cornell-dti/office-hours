import React, { useEffect, useState } from 'react';
import {connect} from 'react-redux'
import '../../styles/Chatbox.scss';
import SendIcon from '../../media/send-icon.png';
import Dropdown from '../../media/chevron-down.svg';
import { getAllMessages, getSessionMessages, addMessage } from '../../firebasefunctions/chatmessages';
import ChatMessage from './ChatMessage';
import { firestore } from '../../firebase';
import firebase from 'firebase/app';
import { RootState } from '../../redux/store';
import datatime from 'react';

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
    user: FireUser | undefined;
    name: string;
    session?: FireSession | undefined;
    timeSent: string;
}

const Chatbox = (props: Props) => {
    var message1 : Message = {
        message: "this is the first message you sent",
        user: props.user,
        name: "Lily Pham",
        session: props.session,
        timeSent: ""
    }
    
    const [showChat, setShowChat] = useState(false);
    const [image, setImage] = useState(props.user ? props.user.photoUrl : '/placeholder.png');
    const userPhotoUrl = props.user ? props.user.photoUrl : '/placeholder.png';
    useEffect(() => setImage(userPhotoUrl), [userPhotoUrl]); 

    const user = props.user;
    const [input, setInput] = useState("")
    const [chatMessages, setChatMessages] = useState<Message[]>(allMessages)
    var name: string | undefined = user?.firstName + ' ' + user?.lastName

    function allMessages() : Message[] {
        let x : Message[] = []
        getAllMessages().then(data => {
            x = [...data]
        })
        return x
    }

    function sessionMessages() : Message[] {
        let x : Message[] = []
        getSessionMessages(props.session).then(data => {
            x = [...data]
        })
        return x
    }

    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter' && input != "") {
          sendMessage();
          setChatMessages( (x) => chatMessages ? chatMessages : [])
        }
      }
  
      const sendMessage = async () => {
        var newMessage = {
                message: input,
                user: props.user,
                name: props.user?.firstName + ' ' + props.user?.lastName,
                session: props.session,
                timeSent: "time holder",
            }
        chatMessages.push(newMessage)
        const messagesRef = firestore.collection('chatmessages');
        await messagesRef.add({
            text: input,
            timeSent: firebase.firestore.FieldValue.serverTimestamp(),
            courseId: props.courseId,
            senderId: props.user,
            session: props.session,
        })
        setInput("")
      }
    

    return (
        <div className="ChatBox" onBlur={() => setShowChat(false)}>
            <div className="ChatBoxTop">
                <header className="ChatBoxTopText">CS 1110 Queue Chat</header>
                <img className="dropdownIcon" src={Dropdown} alt="" />
            </div>
            <div className="chatMessages">
                {
                chatMessages && chatMessages.map(msg => <ChatMessage 
                    msg={msg.message} 
                    sentBySelf={msg.user == props.user}
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