import * as express from 'express';
import * as firebase from 'firebase';

const app = express();

app.get('/users', (req, res) => {
    res.json([{
        id: 1,
        username: "samsepi0l"
    }, {
        id: 2,
        username: "D0loresH4ze"
    }]);
});


app.listen(3001, () => console.log('Example app listening on port 3001!'));
