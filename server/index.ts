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
        console.log(profile)
        console.log("Logging")
        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //     return cb(err, user);
        // });
    }
))

app.get('/auth',
    passport.authenticate('google', {
        scope: ['email'],
        hostedDomain: "cornell.edu"
    }),
    function (req, res) {
        res.send(req.query.code)
    }
)

app.get('/auth/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        res.send(req.query.code)
    }
)

app.listen(3001);
