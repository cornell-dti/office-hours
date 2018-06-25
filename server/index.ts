import * as express from 'express';
import * as bodyparser from 'body-parser';
import * as path from 'path';
import postgraphql from 'postgraphql';
import * as passport from 'passport';
import * as sslRedirect from 'heroku-ssl-redirect';

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { graphql } from 'graphql';
import { readFileSync, readFile } from 'fs';

var session = require('cookie-session');
var request = require('request');
var jwt = require('jsonwebtoken');

const app = express();
app.use(sslRedirect());

const optionDefinitions = [
    { name: 'fakeuserid', type: Number }
];

const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);

// Initialize session middleware
var sessionOptions = {
    name: 'queue-me-in-cookie',
    maxAge: 1 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* milliseconds */,
    secure: false,
    secret: (process.env.OH_SESSION_SECRET || "<veWHM#Q9a<k8^")
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sessionOptions.secure = true // serve secure cookies
}

app.use(session(sessionOptions))

// Initialize Passport and Strategy
app.use(passport.initialize());
app.use(passport.session());

var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy(
    {
        clientID: "694487664328-79nbgbrnm3n3sa3nfsdfm5jigkr69svp.apps.googleusercontent.com",
        clientSecret: process.env.OH_GOOGLE_SECRET,
        callbackURL: "/__auth/callback",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, done) {
        var variables = {
            googleId: profile._json.sub, email: profile._json.email,
            firstName: profile._json.given_name, lastName: profile._json.family_name,
            photoUrl: profile._json.picture
        };

        if (variables.firstName.length == 0) {
            delete variables.firstName;
        }
        if (variables.lastName.length == 0) {
            delete variables.lastName;
        }
        if (variables.photoUrl.length == 0) {
            delete variables.photoUrl;
        }

        var variablesString = JSON.stringify(variables).replace(/"/g, '\\"');

        var bodyContent = '{"query":"mutation loginUser($email: String!, $googleId: String!, $firstName: String, $lastName: String, $photoUrl: String) {' +
            'apiFindOrCreateUser(input: {_email: $email, _googleId: $googleId, _firstName: $firstName, _lastName: $lastName, _photoUrl: $photoUrl}) {' +
            'users {' +
            'userId' +
            '}' +
            '}' +
            '}' +
            '","variables":"' +
            variablesString +
            '"}';
        console.log(bodyContent);
        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://localhost:3001/__gql/graphql',
            body: bodyContent
        }, function (error, response, body) {
            return (done(null, JSON.parse(body).data.apiFindOrCreateUser.users[0]));
        });
    }
))

passport.serializeUser(function (user: any, done) {
    var token = jwt.sign(user, (process.env.OH_JWT_SECRET || "<veWHM#Q9a<k8^"), {
        expiresIn: '1d',
        audience: 'postgraphql',
    });
    console.log(token);
    done(null, token);
})

passport.deserializeUser(function (token, done) {
    done(null, token);
})

app.get('/__auth',
    passport.authenticate('google', {
        scope: ['email'],
        // @ts-ignore: Hosted domain is used by the Google strategy, but not allowed in passport's types
        hostedDomain: "cornell.edu",
        failureRedirect: '/login'
    })
)
app.get('/__auth/callback',
    passport.authenticate('google'),
    function (req, res) {
        console.log("Callback:")
        console.log(req.user)
        res.redirect('/');
    }
)

app.get('/__sess',
    function (req, res) {
        console.log("####################")
        console.log("Session Test:")
        console.log(req.user)
        if (req.user == undefined) {
            res.redirect('/login');
        }
        res.send(req.user)
    }
)

// Add jwt_token as Authorization header for Postgraphql
// Alternative: might be able to use pgSettings to directly? (https://www.graphile.org/postgraphile/usage-library/)
app.use(function (req, res, next) {
    if (req.url === '/__gql/graphql') {
        if (req.user) {
            req.headers.authorization = `Bearer ${req.user}`;
        } else {
            if (options.fakeuserid) {
                const fakeJwt = jwt.sign({ userId: options.fakeuserid }, (process.env.OH_JWT_SECRET || "<veWHM#Q9a<k8^"), {
                    expiresIn: '1y',
                    audience: 'postgraphql',
                });
                req.headers.authorization = `Bearer ${fakeJwt}`;
            }
        }
    }
    next();
});

app.use(postgraphql(process.env.DATABASE_URL || 'postgres://localhost:5432', {
    graphiql: true,
    graphqlRoute: '/__gql/graphql',
    graphiqlRoute: '/__gql/graphiql',
    jwtSecret: (process.env.OH_JWT_SECRET || "<veWHM#Q9a<k8^"),
    jwtPgTypeIdentifier: 'public.jwt_token'
}));

app.use(express.static('../client/build'));
app.listen(process.env.PORT || 3001, () => {
    console.log("Now listening on port " + (process.env.PORT || 3001));
});
