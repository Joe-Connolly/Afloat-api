import mongoose from 'mongoose';
import CreditCard from '../Models/CreditCardModel';
import User from '../Models/UserModel';

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
  newCreditCard.user = mongoose.Types.ObjectId(req.user.id);
  return newCreditCard.save((err) => {
    if (err) {
      console.log('Card not added');
      res.json({ error: 'card not added' });
    } else {
      console.log('Card added successfully');
      User.findByIdAndUpdate(
        req.user.id,
        { $push: { creditCards: newCreditCard } },
        { safe: true, upsert: true },
        (error) => {
          if (error) {
            res.status(422).send({ err });
          }
        },
      );
      res.json({ card: newCreditCard });
    }
  });
};

// Utility method to sanitize credit card record before sending
// Sends only the last four digits of card number
const cleanCreditCard = (card) => {
  const lastFour = card.number % 10000;
  const id = card._id;
  return { id, lastFour };
};

// Utility method to sanitize credit card records before sending
const cleanCreditCards = transactions => transactions.map(card => cleanCreditCard(card));


export const getCardsForUser = (req, res) => {
  CreditCard.find({ user: req.user.id }, (err, docs) => {
    res.send(cleanCreditCards(docs));
  }).catch((err) => { res.status(500).send({ err }); });
};
