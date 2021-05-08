const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

// passport.use(
//   new LocalStrategy({ usernameField: 'email' }, (username, password, done) => {
//     User.findOne({ email: username }, (err, user) => {
//       if (err) return done(err);
//       // unknown user
//       else if (!user)
//         return done(null, false, { message: 'Email is not registered' });
//       // wrong password
//       else if (!user.verifyPassword(password))
//         return done(null, false, { message: 'Wrong password.' });
//       // authentication succeeded
//       else return done(null, user);
//     });
//   })
// );

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
