import Transaction from '../Models/TransactionModel';
import User from '../Models/UserModel';

const axios = require('axios');


// Utility method to sanitize transaction record before sending
const cleanTransaction = (transaction) => {
  const { paymentId, date, amount, status } = transaction;
  return { paymentId, date, amount, status };
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
  const { paymentId, orderId } = req.body;

  if (!paymentId) {
    return res.status(422).json({
      errors: {
        paymentId: 'Missing',
      },
    });
  }

  Transaction.findOne({ orderId }, (err, transaction) => {
    transaction.paymentId = paymentId;
    transaction.save((e) => {
      if (e) {
        console.error('ERROR!');
      }
    });
    console.log(transaction);
    res.send(transaction);
  });
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
      // Build transaction
      console.log(response);
      const transaction = new Transaction({ orderId: response.data.id, paymentId: 'as' });
      transaction.user = req.user.id;
      console.log(req.body.amount);
      transaction.amount = amount;

      // Save transaction
      transaction.save().then((result) => {
        console.log('created new transaction');
        // Update parent
        User.findByIdAndUpdate(
          req.user.id,
          { $push: { transactions: result } },
          { safe: true, upsert: true },
          (err) => {
            if (err) {
              res.status(422).send({ err });
            }
            console.log('updated user');
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

// Method that creates a transaction for a user
export const razorpayWebhook = (req, res) => {
  console.log(req.body);
  const { event } = req.body;
  const { order_id, status } = req.body.payload.payment.entity;


  Transaction.findOne({ orderId: order_id }, (err, transaction) => {
    if (err) {
      res.status(400);
    }

    transaction.status = status;
    transaction.save((e) => {
      if (e) {
        console.error('ERROR!');
        res.status(420);
      }
    });
    res.status(200);
  });
};
