import React, { useEffect, useState } from 'react';

type Prop = {
  msg: String;
}

const ChatMessage = (props: Prop) => {
  return (
    <header className='chatMessagesDisplayed'>{props.msg}</header>
  );
}


export default ChatMessage;

