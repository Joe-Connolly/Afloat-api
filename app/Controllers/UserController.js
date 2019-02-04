import passport from '../passport';
import User from '../Models/UserModel';

export const signup = (req, res, next) => {
  const user = req.body;

  // Validate fields were added
  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: 'Error, email is required',
      },
    });
  }
  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: 'Error, password is required',
      },
    });
  }

  // Build new user
  const newUser = new User(user);
  return newUser.save((err, user) => {
    if (err) {
      res.json({ error: 'email already exists' });
    } else {
      res.json({ user: newUser.toAuthJSON() });
    }
  });
};


export const signin = (req, res, next) => {
  const user = req.body;

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: 'Error: email is required',
      },
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: 'Error: password is required',
      },
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if (err) {
      return next(err);
    }

    if (passportUser) {
      const u = passportUser;
      u.token = passportUser.generateJWT();

      return res.json({ user: u.toAuthJSON() });
    }

    res.send(400);
  })(req, res, next);
};

