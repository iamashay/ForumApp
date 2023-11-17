const passport = require('passport')
const LocalStrategy = require('passport-local')
const GoogleStrategy = require('passport-google-oauth20');
const UserModel = require('./models/User')
const bcrypt = require('bcryptjs')
require('dotenv').config()

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@_';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
        
        const user = await UserModel.findOne({ username });
        if (!user) {
            return done(null, false, { message: "Incorrect username" });
        };
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
            return done(null, false, { message: "Incorrect password" });
        };
        return done(null, user);
        } catch(err) {
        return done(err);
        };
    })
);


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback', // Adjust the callback URL
},
async (accessToken, refreshToken, profile, done) => {
    // Find or create a user with the Google ID
    const user = await UserModel.findOne({ googleId: profile.id });
    if (user) {
        return done(null, user);
    } else {
        // Create a new user with the Google ID
        const newUser = new UserModel({
            googleId: profile.id,
            username: profile.emails[0].value, // You might use a different strategy to generate a username
            password: generateRandomString(5)
        });
        await newUser.save()
        return done(null, newUser);
    }    
}));



passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser(async (id, done) => {
try {
    const user = await UserModel.findById(id);
    done(null, user);
} catch(err) {
    done(err);
};
});

module.exports = passport