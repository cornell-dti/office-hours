import React, { useEffect, useState } from 'react';

type Prop = {
  msg: string;
}

const ChatMessage = (props: Prop) => {
  return (
    <header className='chatMessagesDisplayed'>{props.msg}</header>
  );
}


export default ChatMessage;

