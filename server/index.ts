import * as express from 'express';
import * as session from 'express-session';
import * as bodyparser from 'body-parser';
import * as path from 'path';
import postgraphql from 'postgraphql';
import * as passport from 'passport';

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { graphql } from 'graphql';
import { readFileSync, readFile } from 'fs'

const app = express();

// Initialize session middleware
var sessionOptions = {
    secret: (process.env.OH_SESSION_SECRET || "<veWHM#Q9a<k8^"),
    cookie: {
        secure: false
    }
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sessionOptions.cookie.secure = true // serve secure cookies
}

app.use(session(sessionOptions))

// Initialize Passport and Strategy
app.use(passport.initialize());
app.use(passport.session());
var GoogleStrategy = require('passport-google-oauth20').Strategy;


const schemaString = readFileSync('schema.gql').toString();

// Make a GraphQL schema with no resolvers
const schema = makeExecutableSchema({ typeDefs: schemaString });

// Add mocks, modifies schema in place
addMockFunctionsToSchema({ schema });
app.use(
    '/__gql/graphql',
    bodyparser.json(),
    graphqlExpress({
        schema: schema,
        context: {}, // at least(!) an empty object
    })
);
app.use(
    '/__gql/graphiql',
    graphiqlExpress({
        endpointURL: '/__gql/graphql',
    })
);
// app.use(postgraphql(process.env.DATABASE_URL || 'postgres://localhost:5432', {
//     graphiql: true,
//     graphqlRoute: '/__gql/graphql',
//     graphiqlRoute: '/__gql/graphiql'
// }));

app.use(express.static('../client/build'));
app.listen(process.env.PORT || 3001, () => {
    console.log("Now listening on port " + (process.env.PORT || 3001));
});
