import Razorpay from 'razorpay';
import Transaction from '../Models/TransactionModel';
import User from '../Models/UserModel';

const axios = require('axios');


// Utility method to sanitize transaction record before sending
const cleanTransaction = (transaction) => {
  const { paymentId, date, amount, status, orderId } = transaction;
  return { paymentId, date, amount, status, orderId };
};

// Utility method to sanitize transaction records before sending
const cleanTransactions = transactions => transactions.map(transaction => cleanTransaction(transaction));

// Method that gets all transactions for a given user
export const getTransactionsForUser = (req, res) => {
  Transaction.find({ user: req.user.id }, (err, docs) => {
    res.send(cleanTransactions(docs));
  }).catch((err) => { res.status(500).send({ err }); });
};

// Method that adds a payment to the transaction
export const createTransaction = (req, res) => {
  const { paymentId, orderId } = req.body;

  if (!orderId) {
    return res.status(422).json({
      errors: {
        paymentId: 'Missing',
      },
    });
  }

  // add returned paymentId to transaction
  Transaction.findOne({ orderId }, (err, transaction) => {
    transaction.paymentId = paymentId;
    transaction.save((e) => {
      if (e) {
        console.error('ERROR!');
      }
    });
    res.send(transaction);
  });
};

// Method that creates an order with razorpay
export const createOrder = (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(422).json({
      errors: {
        paymentId: 'Missing',
      },
    });
  }

  User.findById(
    req.user.id,
    (err, user) => {
      if (err) {
        res.status(422).send({ err });
      }

      if (!user.bankSet) {
        res.status(423);
      }
    },
  );

  // post request to razorpay order route
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
      const transaction = new Transaction({ orderId: response.data.id });
      transaction.user = req.user.id;
      transaction.status = 'created';
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
            res.send(result);
          },
        );
      }).catch((error) => { res.status(500).send({ error }); });
    })
    .catch((error) => {
      console.log(error);
    });
};

// Method that updates status on order.paid or payment.failed
export const razorpayWebhook = (req, res) => {
  const { order_id, status } = req.body.payload.payment.entity;

  Transaction.findOne({ orderId: order_id }, (err, transaction) => {
    if (err) {
      res.status(400);
      console.log('cannot find transaction');
    }

    transaction.status = status;
    transaction.save((e) => {
      if (e) {
        console.error('ERROR!');
        res.status(420);
      }
    });

    if (transaction.status === 'captured') {
      const rzp = new Razorpay({
        key_id: 'rzp_test_XYB3SORKydGnpK',
        key_secret: 'ft2aYQjcNzwoVoZxQ6Gl4KVZ',
      });

      User.findById(
        transaction.user,
        (e, user) => {
          if (e) {
            res.status(422).send({ e });
          }
          rzp.payments.transfer(transaction.paymentId, {
            transfers: [
              {
                account: user.bankAccount,
                amount: parseInt(transaction.amount * 0.94, 10),
                currency: 'INR',
              },
            ],
          }).then((data) => {
            console.log();
            console.log(data);
          }).catch((error) => {
            console.error(error);
            res.status(421);
          });
        },
      );
    }
    res.status(200);
  });
};
