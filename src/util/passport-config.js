const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (username, password, done) => {
      let user;
      try {
        user = await User.findOne({ email: username });
        if (!user) {
          return done(null, false, { message: 'Email is not registered' });
        }
      } catch (err) {
        return done(err.message);
      }
      const match = await user.verifyPassword(password);
      if (!match) {
        return done(null, false, { message: 'Wrong password' });
      }
      return done(null, user);
    }
  )
);
