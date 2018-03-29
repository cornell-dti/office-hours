import * as express from 'express';
import * as session from 'express-session';

import * as path from 'path';
import postgraphql from 'postgraphql';
import * as passport from 'passport';

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

app.use(postgraphql(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres', {
    graphiql: true,
    graphqlRoute: '/__gql/graphql',
    graphiqlRoute: '/__gql/graphiql'
}));

passport.use(new GoogleStrategy(
    {
        clientID: "694487664328-79nbgbrnm3n3sa3nfsdfm5jigkr69svp.apps.googleusercontent.com",
        clientSecret: process.env.OH_GOOGLE_SECRET,
        callbackURL: "/__auth/callback",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile.id)
        return (cb(null, profile))
        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //     return cb(err, user);
        // });
    }
))

passport.serializeUser(function (user, done) {
    // @ts-ignore
    done(null, user.id)
})

passport.deserializeUser(function (user, done) {
    done(null, user)
})

app.get('/__auth',
    passport.authenticate('google', {
        scope: ['email'],
        // @ts-ignore: Hosted domain is used by the Google strategy, but not allowed in passport's types
        hostedDomain: "cornell.edu"
    })
)

app.get('/__auth/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
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

app.use(express.static(path.resolve(__dirname, '../client/build')));
app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
});

app.listen(process.env.PORT || 3001, () => {
    console.log("Now listening on port " + (process.env.PORT || 3001));
});
