import passport from 'passport';
import LocalStrategy from 'passport-local';
import User from '../Models/UserModel';

const localOptions = { usernameField: 'email', passwordField: 'password' };

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use('local', new LocalStrategy(localOptions, (email, password, done) => {
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return done(null, false, { errors: { loginInfo: 'password or email invalid' } });
      }

      return user.comparePassword(password, (error, isMatch) => {
        if (error) {
          done(error);
        } else if (!isMatch) {
          done(null, false, { message: 'Error: passwords dont match' });
        } else {
          done(null, user);
        }
      });
    }).catch(done);
}));

export default passport;
