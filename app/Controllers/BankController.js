import mongoose from 'mongoose';
import plaid from 'plaid';

import User from '../Models/UserModel';


export const addBank = (req, res) => {
  User.findById(
    req.user.id,
    (err, user) => {
      if (err) {
        res.status(422).send({ err });
      }

      const plaidClient = new plaid.Client('5ca67be24a965e00118c857b', 'f19c9bfdf87541cf00b69428ea2113', 'beae29cb016901b1a1d8ac65538e8a', plaid.environments.sandbox);
      // console.log(req.body.publicToken);
      // createPublicToken(String, Function)

      plaidClient.exchangePublicToken(req.body.publicToken)
        .then((response) => {
          user.publicToken = req.body.publicToken;
          user.accessToken = response.access_token;
          user.itemId = response.item_id;
          user.bankSet = true;
          console.error('loaded');
          user.save((e) => {
            if (e) {
              console.error('ERROR!');
            }
          });
          res.status(200).send();
        });
    },
  );
};

export const getTransactions = (req, res) => {
  User.findById(
    req.user.id,
    (err, user) => {
      if (err) {
        res.status(422).send({ err });
      }
      const plaidClient = new plaid.Client('5ca67be24a965e00118c857b', 'f19c9bfdf87541cf00b69428ea2113', 'beae29cb016901b1a1d8ac65538e8a', plaid.environments.sandbox);
      plaidClient.getTransactions(user.accessToken, '2018-01-01', '2019-04-13').then((resAccess) => {
        res.send(resAccess);
      }).catch((error) => { console.log(error); });
    },
  );
};

// plaidClient.getTransactions(accessToken, '2018-01-01', '2019-03-01').then((resAccess) => {
//   console.log('hi');
// }).catch((error) => { console.log(error); });

export const getCardsForUser = (req, res) => {
  CreditCard.find({ user: req.user.id }, (err, docs) => {
    res.send(cleanCreditCards(docs));
  }).catch((err) => { res.status(500).send({ err }); });
};
