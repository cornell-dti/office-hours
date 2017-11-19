import * as express from 'express';
import * as firebase from 'firebase';

// const firebaseSer
// import * as firebaseserver from 'firebase-server';

const app = express();

const config = {
  authDomain: 'office-hours-b7f4c.firebaseapp.com',
  // databaseURL: 'https://office-hours-b7f4c.firebaseio.com',
  databaseURL: 'ws://127.0.1:5005',
  projectId: 'office-hours-b7f4c',
  storageBucket: 'office-hours-b7f4c.appspot.com',
  messagingSenderId: '568482409494',
};

firebase.initializeApp(config);
const db = firebase.database();
// firebase.database().goOffline();

app.get('/users', async (req, res) => {
  db.ref('/').push('asdf');
  await db
    .ref('/')
    .once('value')
    .then((x: firebase.database.DataSnapshot) => console.log(x.toJSON()));
  res.json([
    {
      id: 1,
      username: 'samsepi0l',
    },
    {
      id: 2,
      username: 'D0loresH4ze',
    },
  ]);
});

app.listen(3001, () => console.log('Backend for Office Hours listening on port 3001'));
