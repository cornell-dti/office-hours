import React, { useEffect, useState } from 'react';
import '../../styles/Chatbox.scss';


type Prop = {
  msg: string;
  sentBySelf: boolean;
  name: string;
}

const ChatMessage = (props: Prop) => {
    return (
        <div className='chatMessage'>
            <p className='displayName'>{props.name}</p>

            <div className='message'>
                {props.sentBySelf ? 
                <header className='chatMessagesSelf'>{props.msg}</header> : 
                <header className='chatMessagesOther'>{props.msg}</header>}
            </div>

        </div>
      
    );
}


export default ChatMessage;

