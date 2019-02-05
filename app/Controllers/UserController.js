import passport from '../core/passport';
import User from '../Models/UserModel';

export const signup = (req, res) => {
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
  return newUser.save((err) => {
    if (err) {
      res.json({ error: 'email already exists' });
    } else {
      res.json({ user: newUser.toAuthJSON() });
    }
  });
};


export const signin = (req, res, next) => {
  const user = req.body;

  // Validate email and password fields were provided
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

  // Use local strategy to validate passport user
  return passport.authenticate('local', { session: false }, (err, passportUser) => {
    if (err) {
      return next(err);
    }

    // If a user is returned, generate JWT and send to user
    if (passportUser) {
      const userObject = passportUser;
      userObject.token = passportUser.generateJWT();

      // Send token
      return res.json({ user: userObject.toAuthJSON() });
    }

    return res.send(400);
  })(req, res, next);
};
