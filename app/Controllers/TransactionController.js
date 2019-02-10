import Transaction from '../Models/TransactionModel';
import User from '../Models/UserModel';

const axios = require('axios');


// Utility method to sanitize transaction record before sending
const cleanTransaction = (transaction) => {
  const { paymentId, date, amount } = transaction;
  return { paymentId, date, amount };
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

// Method that creates a transaction for a user
export const createOrder = (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(422).json({
      errors: {
        paymentId: 'Missing',
      },
    });
  }

  axios.post('https://api.razorpay.com/v1/orders',
    {
      amount,
      currency: 'INR',
      receipt: 'backend',
      payment_capture: 1,
    },
    {
      auth: {
        username: 'rzp_test_XYB3SORKydGnpK',
        password: 'ft2aYQjcNzwoVoZxQ6Gl4KVZ',
      },
    })
    .then((response) => {
      console.log(response.data);

      // Build transaction
      const transaction = new Transaction({ orderId: response.data.id, paymentId: response.data.id });
      transaction.user = req.user.id;
      console.log(req.user.amount);
      transaction.amount = amount;

      // Save transaction
      transaction.save().then((result) => {
        console.log(result);
        // Update parent
        User.findByIdAndUpdate(
          req.user.id,
          { $push: { transactions: result } },
          { safe: true, upsert: true },
          (err) => {
            if (err) {
              res.status(422).send({ err });
            }
            // console.log(result);
            res.send(result);
          },
        );
      }).catch((error) => { res.status(500).send({ error }); });
    })
    .catch((error) => {
      console.log(error);
    });
};
