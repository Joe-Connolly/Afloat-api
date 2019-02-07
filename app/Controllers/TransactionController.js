import Transaction from '../Models/TransactionModel';
import User from '../Models/UserModel';

// Method that creates a transaction for a user
export const createTransaction = (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(422).json({
      errors: {
        paymentId: 'Missing',
      },
    });
  }

  // Build transaction
  const transaction = new Transaction({ paymentId });
  transaction.user = req.user.id;

  // Save transaction
  transaction.save().then((result) => {
    // Update parent
    User.findByIdAndUpdate(
      req.user.id,
      { $push: { transactions: result } },
      { safe: true, upsert: true },
      (err) => {
        if (err) {
          res.status(422).send({ err });
        }
      },
    );
  }).catch((error) => { res.status(500).send({ error }); });
};
