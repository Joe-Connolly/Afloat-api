import mongoose from 'mongoose';
import plaid from 'plaid';
import dwolla from 'dwolla-v2';
import date from 'datejs';
import fetchFavicon from '@meltwater/fetch-favicon';
import google from 'google';
import dateFormat from 'dateformat';
import User from '../Models/UserModel';
import Transfer from '../Models/TransactionModel';


const plaidClientId = '5ca67be24a965e00118c857b';
const plaidSecret = 'f19c9bfdf87541cf00b69428ea2113';
const plaidPublic = 'beae29cb016901b1a1d8ac65538e8a';
const dwallaPublic = 'UWHnZ6XbTZ5bZV0nVbgAZLlkOUCsY8seTSzmrul6oKyExU73C6';
const dwallaKey = 'gfqUFFSAAU61tLhlriKIyysvau5nsFZLrDIdf3saDuGKF1Av6i';


export const addBank = (req, res) => {
  User.findById(
    req.user.id,
    (err, user) => {
      if (err) {
        res.status(422).send({ err });
      }

      const plaidClient = new plaid.Client(plaidClientId, plaidSecret, plaidPublic, plaid.environments.sandbox);
      // console.log(req.body.publicToken);
      // createPublicToken(String, Function)

      plaidClient.exchangePublicToken(req.body.publicToken)
        .then((response) => {
          user.publicToken = req.body.publicToken;
          user.accessToken = response.access_token;
          user.itemId = response.item_id;
          user.accountId = req.body.accountId;
          user.bankSet = true;

          const client = new dwolla.Client({
            key: dwallaPublic,
            secret: dwallaKey,
            environment: 'sandbox',
          });

          const requestBody = {
            firstName: user.firstname,
            lastName: user.lastname,
            email: user.email,
          };

          client.auth.client()
            .then((appToken) => {
              appToken.post('customers', requestBody)
                .then((createCustomerResponse) => {
                  const customerUrl = createCustomerResponse.headers.get('location');
                  user.customerUrl = customerUrl;

                  plaidClient.createProcessorToken(user.accessToken, user.accountId,
                    'dwolla', (err2, res2) => {
                      const processorToken = res2.processor_token;
                      const requestBodyFunding = {
                        plaidToken: processorToken,
                        name: 'check',
                      };
                      appToken
                        .post(`${customerUrl}/funding-sources`, requestBodyFunding)
                        .then((res3) => {
                          const userAccount = res3.headers.get('location');
                          user.accountUrl = userAccount;
                          user.save((e) => {
                            if (e) {
                              console.error('ERROR!');
                            }
                          });
                          console.log(user);
                          res.status(200);
                        });
                    });
                }, (err3) => { console.log(err3); });
            });

          res.status(200).send();
        });
    },
  );
};

export const transferAchToUser = (req, res) => {
  console.log((1).months().fromNow());
  User.findById(
    req.user.id,
    (err, user) => {
      if (err) {
        res.status(422).send({ err });
      }

      const client = new dwolla.Client({
        key: dwallaPublic,
        secret: dwallaKey,
        environment: 'sandbox',
      });

      client.auth.client()
        .then((appToken) => {
          console.log(user);
          const requestBody = {
            _links: {
              source: {
                href: 'https://api-sandbox.dwolla.com/funding-sources/59e9024d-b406-4a48-9c9a-7d019a7d242a',
              },
              destination: {
                href: user.accountUrl,
              },
            },
            amount: {
              currency: 'USD',
              value: '100.00',
            },
            metadata: {
              paymentId: '12345678',
              note: 'test payment',
            },
            clearing: {
              destination: 'next-available',
              source: 'standard',
            },
            correlationId: '8a2cdc8d-629d-4a24-98ac-40b735229fe2',
          };

          appToken
            .post('transfers', requestBody)
            .then((res3) => {
              const transfer = res3.headers.get('location');

              const newTransfer = new Transfer();
              newTransfer.user = req.user.id;
              newTransfer.transactionId = transfer;
              newTransfer.amount = req.body.amount;
              newTransfer.incoming = false;
              newTransfer.type = 'LOAN_DISBURSEMENT';
              newTransfer.status = 'PROCESSING';
              console.log(newTransfer);
              newTransfer.save((e, prod) => {
                if (e) {
                  console.error(e);
                }
                console.log(prod);
              });

              console.log('created successfully');
              console.log(res3.headers.get('location'));
              res.send({ amount: req.body.amount });
            });
        });
    },
  );
};

export const enrollSubscription = (req, res) => {
  User.findById(
    req.user.id,
    (err, user) => {
      if (err) {
        res.status(422).send({ err });
      }

      const client = new dwolla.Client({
        key: dwallaPublic,
        secret: dwallaKey,
        environment: 'sandbox',
      });

      client.auth.client()
        .then((appToken) => {
          console.log(user);
          const requestBody = {
            _links: {
              destination: {
                href: 'https://api-sandbox.dwolla.com/funding-sources/59e9024d-b406-4a48-9c9a-7d019a7d242a',
              },
              source: {
                href: user.accountUrl,
              },
            },
            amount: {
              currency: 'USD',
              value: '10.00',
            },
            metadata: {
              type: 'SUBSCRIPTION',
            },
            clearing: {
              destination: 'next-available',
              source: 'standard',
            },
            correlationId: '8a2cdc8d-629d-4a24-98ac-40b735229fe2',
          };

          appToken
            .post('transfers', requestBody)
            .then((res3) => {
              const transfer = res3.headers.get('location');

              const newTransfer = new Transfer();
              newTransfer.user = req.user.id;
              newTransfer.transactionId = transfer;
              newTransfer.amount = 10.00;
              newTransfer.incoming = true;
              newTransfer.type = 'SUBSCRIPTION';
              newTransfer.status = 'PROCESSING';
              console.log(newTransfer);
              newTransfer.save((e, prod) => {
                if (e) {
                  console.error(e);
                }

                user.active = true;
                user.subscriptionEnrolled = true;
                // user.activeUntil = (1).months().fromNow();
                user.activeUntil = Date.today();
                user.save((e, prod) => {
                  if (e) {
                    console.error(e);
                  }
                });
              });

              console.log('created successfully');
              console.log(res3.headers.get('location'));
              res.send({ amount: req.body.amount });
            });
        });
    },
  );
};

export const getTransactions = async (req, res) => {
  User.findById(
    req.user.id,
    (err, user) => {
      if (err) {
        res.status(422).send({ err });
      }
      const plaidClient = new plaid.Client(plaidClientId, plaidSecret, plaidPublic, plaid.environments.sandbox);
      plaidClient.getTransactions(user.accessToken, '2019-01-01', '2019-04-13').then(async (resAccess) => {
        // console.log(resAccess.transactions);
        const promises = [];
        for (const t of resAccess.transactions) {
          promises.push(new Promise(async (resolve) => {
            const trans = t;
            google.resultsPerPage = 1;
            await google('amazon', async (err, googleRes) => {
              if (err) console.error(err);
              if (googleRes.links && googleRes.links[0] && googleRes.links[0].link) {
                const firstResult = googleRes.links[0].link;
                await fetchFavicon(firstResult).then((r) => {
                  trans.iconURL = r;
                  resolve(trans);
                });
              }
            });
          }));
        }

        Promise.all(promises).then((test) => {
          console.log(test);
          res.send(test);
        });

        // const resWithIcons = await resAccess.transactions.map(async (transaction) => {
        //   const t = transaction;
        // google.resultsPerPage = 1;

        // await google('amazon', async (err, googleRes) => {
        //   if (err) console.error(err);
        //   console.log('yo yo ytest test');
        //   console.log(googleRes);
        //   const firstResult = googleRes.links[0].link;
        //   await fetchFavicon(firstResult).then((r) => {
        //     console.log('Y(O YO YO ');
        //     t.iconURL = r.data;
        //   });
        // });

        //   return t;
        // });
        // // console.log(`withIcons: ${JSON.stringify(resWithIcons)}`);
        // console.log('sending response');
        // res.send(resWithIcons);
      }).catch((error) => { console.log(error); });
    },
  );
};

export const getBalanceRange = (req, res) => {
  // Get and check request
  const { body, user } = req;
  if (body && body.date && user && user.id) {
    // Consts and variables
    const startDate = new Date(body.date);
    const today = new Date();
    const endDateString = dateFormat(today, 'yyyy-mm-dd');
    const startDateString = dateFormat(startDate, 'yyyy-mm-dd');
    let plaidClient;
    let totalBalance = 0;


    // TODO: We need to persist which accounts are tracked by the app
    const balanceAccounts = ['checking', 'savings'];

    User.findById(
      user.id,
      (err, userObj) => {
        if (err) {
          res.status(422).send({ err });
        }

        // Build Plaid Client
        plaidClient = new plaid.Client(plaidClientId, plaidSecret, plaidPublic, plaid.environments.sandbox);

        // Get total balance for user
        plaidClient.getBalance(userObj.accessToken, (err, balances) => {
          if (err) {
            res.send('Error getting balance');
          }
          balances.accounts.forEach((val) => {
            if (balanceAccounts.indexOf(val.subtype) > -1) {
              totalBalance += val.balances.current;
            }
          });

          // Get all transactions for user
          plaidClient.getTransactions(userObj.accessToken, startDateString, endDateString).then(async (transactions) => {
            res.send(transactions);
          }).catch((error) => { console.log(error); });
        });
      },
    );
  } else {
    res.send('Error, user ID or date missing or invalid');
  }
};

export const getCardsForUser = (req, res) => {
  CreditCard.find({ user: req.user.id }, (err, docs) => {
    res.send(cleanCreditCards(docs));
  }).catch((err) => { res.status(500).send({ err }); });
};
