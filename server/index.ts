import * as express from 'express';
import postgraphql from 'postgraphql';
import * as passport from 'passport';

const app = express();

// app.use(postgraphql('postgres://localhost:5432', { graphiql: true }));

var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy(
    {
        clientID: "694487664328-79nbgbrnm3n3sa3nfsdfm5jigkr69svp.apps.googleusercontent.com",
        clientSecret: process.env.OH_SECRET,
        callbackURL: "http://localhost:3001/auth/callback",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile.emails)
        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //     return cb(err, user);
        // });
    }
))

app.get('/auth',
    passport.authenticate('google', {
        scope: ['email'],
        // @ts-ignore: Hosted domain is used by the Google strategy, but not allowed in passport's types
        hostedDomain: "cornell.edu"
    }),
    function (req, res) {
        res.send("Hello World")
    }
)

app.get('/auth/callback',
    function (req, res) {
        res.redirect('http://localhost:3000/session');
        // res.send("authenticated")
    }
)

app.listen(3001);
