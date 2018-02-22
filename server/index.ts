import * as express from 'express';
import postgraphql from 'postgraphql';
// import bodyParser from 'body-parser';
// import { graphqlExpress } from 'apollo-server-express';

const app = express();

// app.use(postgraphql('postgres://localhost:5432', { graphiql: true }));

// var schema = `
//     type Query {
//         token: String
//     }
// `;
// app.use('/auth', bodyParser.json(), graphqlExpress({ schema: schema }));

app.get('/auth', function (req, res) {
    res.send(req.query.code)
})

app.listen(3001);
