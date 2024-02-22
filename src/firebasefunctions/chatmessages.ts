// import firebase from 'firebase/app';
import { firestore } from '../firebase';
import firebase from 'firebase/app';
import { Message, Props } from '../../src/components/includes/Chatbox';

var message0 : Message = {
  message: "testing firebase",
  userId: 'undefined',
  name: "Lily Pham",
  sessionId: 'undefined',
  timeSent: ""
}


// WORKSSS
export async function getAllMessages(): Promise<Message[]> {
  const messages: Message[] = [message0];
  const messagesRef = await firestore.collection('chatmessages').get();
  messagesRef.forEach(doc => {
      const data = doc.data();
      const message: Message = {
          message: data.message,
          userId: data.senderId,
          name: 'fake name',// Adjust as per your data structure
          sessionId: data.session,
          timeSent: data.timeSent, // Convert Firebase timestamp to string
      };
      messages.push(message);
  });
  return messages;
}


// DOES NOT WORK BECUSE NEED TEST


export async function getSessionMessages(session : FireSession | undefined) {
    const messages: Message[] = [message0];
    const messageRef = await firestore.collection('chatmessages').where('session', '==', session).get();
    messageRef.forEach(doc => {
      const check = doc.data();
      const msg : Message = {message: check.message, userId: check.user, 
      name: check.senderId, sessionId: check.session, timeSent: check.timeSent}
      messages.push(msg);
    });
    return messages;
}

// export const addMessage =
//     async (user: FireUser, message: Omit<Message, 'messageId' | 'createdAt'>) => {
//         if (user !== undefined) {
//             const email = user.email;
//             if (email !== null) {
//                 const trackerRef = firestore.collection('notificationTrackers').doc(email);
//                 const prevTracker = (await trackerRef.get()).data();
//                 const notifList: SessionNotification[] =
//                     prevTracker !== undefined &&
//                         prevTracker.notificatoniList !== undefined ? prevTracker.notificationList : []
//                 const newMessage: Message = {
//                     message: message.message,
//                     userId: message.userId,
//                     name: message.name,
//                     sessionId: message.sessionId,
//                     // timeSent: firebase.firestore.Timestamp.now()
//                     timeSent: message.timeSent
//                 }
//                 if (prevTracker === undefined) {
//                   trackerRef.set(newMessage)
//             }
//         }
//     }
//   }
 
// use a firebase hook 
// make a ref
// .set if doesnt .update if it does
// if new no partial, if modify exist make new partial with pieces you want to update
// use .set, make sure not to override existing document
// export const addMessage = (
//   courseId: string,
//   userId: string,
//   message: string,
//   session: string,
//   userUpdate: Partial<FireUser>
// ): Promise<void> => {
//   return firestore.collection('chatmessages').doc(userId).update(userUpdate)
// };

  // export const messagesConverter = {
  //   toFirestore: function (message: Message) {
  //     return {
  //       // id: event.id,  // Note! Not in ".data()" of the model!
  //       message: message.message,
  //       user: message.user,
  //       name: message.name,
  //       session: message.session,  
  //       timeSent: message.timeSent
  //     }
  //   },
  //   fromFirestore: function (snapshot: any, options: any) {
  //     const data = snapshot.data(options)
  //     const id = snapshot.id
  //     // return {data.message, data.user, data.name, data.session, data.timeSent}
  //   }
  // }
    
    async function get() {
      const messages: Message[] = [];
      // const messageRef = await firestore.collection('chatmessages').where('session', '==', session).get();
      const messageRef = await firestore.collection('chatmessages').get();
      return new Promise <Message[]> (resolve => {
        const v = messageRef.docs.map(x => {
            const obj = x.data();
            obj.id = x.id;
            return obj as Message;
        });
        resolve(v);
    });
    }