const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');

function init(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        // Login
        // check if email exists
        const user = await User.findOne({ email: email });
        if (!user) {
            return done(null, false, { message: 'No user with this email' });
        }

        const passwordCorrect = await bcrypt.compare(password, user.password);

        if (!passwordCorrect) {
            return done(null, false, { message: 'Wrong password' });
        }
        return done(null, user, { message: 'Logged in successfully' });

    }));

    passport.serializeUser((user, done) => {
        return done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        let user = User.findById(id);
        done(null, user);
    });
}

module.exports = init;