import * as express from 'express';
import * as path from 'path';
import postgraphql from 'postgraphql';
import * as passport from 'passport';

const app = express();
app.use(passport.initialize());
var GoogleStrategy = require('passport-google-oauth20').Strategy;

app.use(postgraphql(process.env.DATABASE_URL || 'postgres://localhost:5432', {
    graphiql: true,
    graphqlRoute: '/graphql',
    graphiqlRoute: '/graphiql'
}));

app.use(express.static('../client/build'));

passport.use(new GoogleStrategy(
    {
        clientID: "694487664328-79nbgbrnm3n3sa3nfsdfm5jigkr69svp.apps.googleusercontent.com",
        clientSecret: process.env.OH_SECRET,
        callbackURL: "http://localhost:3001/auth/callback",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile.id)
        return(cb(null, profile))
        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //     return cb(err, user);
        // });
    }
))

passport.serializeUser(function(user, done) {
    done(null, user)
})

passport.deserializeUser(function(user, done) {
    done(null, user)
})

app.get('/auth',
    passport.authenticate('google', {
        scope: ['email'],
        // @ts-ignore: Hosted domain is used by the Google strategy, but not allowed in passport's types
        hostedDomain: "cornell.edu"
    })
)

app.get('/auth/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
    function (req, res) {
        res.redirect('http://localhost:3000/session');
    }
)

app.listen(process.env.PORT || 3001, () => {
    console.log("Now listening on port " + (process.env.PORT || 3001));
});
