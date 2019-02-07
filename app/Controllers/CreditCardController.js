import mongoose from 'mongoose';
import CreditCard from '../Models/CreditCardModel';

export const addCard = (req, res) => {
  const creditCard = req.body;

  // Validate fields were added
  if (!creditCard.number) {
    return res.status(422).json({
      errors: {
        email: 'Error, card number is required',
      },
    });
  }
  if (!creditCard.name) {
    return res.status(422).json({
      errors: {
        password: 'Error, card holder name is required',
      },
    });
  }
  if (!creditCard.exp) {
    return res.status(422).json({
      errors: {
        password: 'Error, card expiration date is required',
      },
    });
  }

  // Build new user
  const newCreditCard = new CreditCard(creditCard);
  newCreditCard.user = mongoose.Types.ObjectId(req.payload.id);
  return newCreditCard.save((err) => {
    if (err) {
      console.log('Card not added');
      res.json({ error: 'card not added' });
    } else {
      console.log('Card added successfully');
      res.json({ card: newCreditCard });
    }
  });
};

//
// export const signin = (req, res, next) => {
//   const user = req.body;
//
//   // Validate email and password fields were provided
//   if (!user.email) {
//     return res.status(422).json({
//       errors: {
//         email: 'Error: email is required',
//       },
//     });
//   }
//
//   if (!user.password) {
//     return res.status(422).json({
//       errors: {
//         password: 'Error: password is required',
//       },
//     });
//   }
//
//   // Use local strategy to validate passport user
//   return passport.authenticate('local', { session: false }, (err, passportUser) => {
//     if (err) {
//       return next(err);
//     }
//
//     // If a user is returned, generate JWT and send to user
//     if (passportUser) {
//       const userObject = passportUser;
//       userObject.token = passportUser.generateJWT();
//
//       // Send token
//       return res.json({ user: userObject.toAuthJSON() });
//     }
//
//     return res.send(400);
//   })(req, res, next);
// };
