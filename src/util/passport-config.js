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
      try {
        const user = await User.findOne({ email: username });
        if (!user) {
          return done(null, false, { message: 'Email is not registered' });
        } else if (!user.verifyPassword(password)) {
          return done(null, false, { message: 'Wrong password.' });
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err.message);
      }
    }
  )
);
