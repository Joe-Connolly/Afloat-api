import Transaction from '../Models/TransactionModel';
import User from '../Models/UserModel';


// Utility method to sanitize transaction record before sending
const cleanTransaction = (transaction) => {
  const { paymentId, date } = transaction;
  return { paymentId, date };
};

// Utility method to sanitize transaction records before sending
const cleanTransactions = transactions => transactions.map(transaction => cleanTransaction(transaction));

// Method that gets all transactions for a given user
export const getTransactionsForUser = (req, res) => {
  Transaction.find({ user: req.user.id }, (err, docs) => {
    res.send(cleanTransactions(docs));
  }).catch((err) => { res.status(500).send({ err }); });
};

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
        res.send(result);
      },
    );
  }).catch((error) => { res.status(500).send({ error }); });
};
