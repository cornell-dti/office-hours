import firebase from 'firebase/app';
import { firestore } from '../firebase';

export const getMessages = (courseId: string) => 
  firestore.collection('chatmessges').where('courseId', '==', courseId
);
// use a firebase hook 
// make a ref
// .set if doesnt .update if it does
// if new no partial, if modify exist make new partial with pieces you want to update
// use .set, make sure not to override existing document


export const addMessage = (
  userId: string,
  message: string,
  userUpdate: Partial<FireUser>
): Promise<void> => {
  return firestore.collection('chatmessages').doc(userId).update(userUpdate)
};
// keep it in firebase functions

var database = firebase.database();

// Send a message to the Firebase collection
function sendMessage(courseID, message, senderId, session) {
  // Get a new key for the message
  var newMessageKey = firebase.database().ref().child('messages').push().key;

  // Set the message data
  var messageData = {
    courseID: courseID,
    message: message,
    senderId: senderId,
    session: session
  };

  // Update the message in the Firebase collection
  var updates = {};
  updates['/messages/' + newMessageKey] = messageData;

  return firebase.database().ref().update(updates);
}

// Get messages from the Firebase collection for a specific courseID and session
function getMessages(courseID, session, callback) {
  // Get a reference to the messages for the specific courseID and session
  var messagesRef = firebase.database().ref('messages').orderByChild('courseID').equalTo(courseID).orderByChild('session').equalTo(session);

  // Listen for new messages and trigger the callback function with the messages data
  messagesRef.on('value', function(snapshot) {
    var messages = [];
    snapshot.forEach(function(childSnapshot) {
      var message = childSnapshot.val();
      messages.push(message);
    });
    callback(messages);
  });
}