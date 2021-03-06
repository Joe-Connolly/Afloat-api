import plaid from 'plaid';
import dwolla from 'dwolla-v2';
import dateFormat from 'dateformat';
import fetchFavicon from '@meltwater/fetch-favicon';
import google from 'google';
import date from 'datejs';
import User from '../Models/UserModel';
import Transfer from '../Models/TransactionModel';
import * as iconController from './IconController';

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

      user.bankStaging = true;
      user.save((e) => {
        if (e) {
          console.error('ERROR!');
        }
      });

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

                  plaidClient.createProcessorToken(response.access_token, user.accountId,
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
                            } else {
                              console.log(user);
                              res.status(200);
                            }
                          });
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
              value: req.body.amount,
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

              user.outstandingBalance = req.body.amount;
              user.save((e, prod) => {
                if (e) {
                  console.error(e);
                }
                console.log('created successfully');
                console.log(res3.headers.get('location'));
                res.send({ amount: req.body.amount });
              });
            });
        });
    },
  );
};

export const transferAchFromUser = (req, res) => {
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
              value: user.outstandingBalance,
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
              newTransfer.amount = user.outstandingBalance;
              newTransfer.incoming = true;
              newTransfer.type = 'LOAN_REPAYMENT';
              newTransfer.status = 'PROCESSING';
              console.log(newTransfer);
              newTransfer.save((e, prod) => {
                if (e) {
                  console.error(e);
                }
                console.log(prod);
              });

              user.outstandingBalance = 0;
              user.balanceActiveUntil = undefined;
              user.save((e, prod) => {
                if (e) {
                  console.error(e);
                }
                console.log('created successfully');
                console.log(res3.headers.get('location'));
                res.status(200).send();
              });
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
                user.activeUntil = (1).months().fromNow();
                // user.activeUntil = Date.today();
                user.save((e, prod) => {
                  if (e) {
                    console.error(e);
                  }
                });
              });

              console.log('created successfully');
              console.log(res3.headers.get('location'));
              res.status(200).send();
            });
        });
    },
  );
};
const asyncFetchIcon = (name) => {
  google.resultsPerPage = 1;

  google(name, async (err, googleRes) => {
    if (err) console.error(err);
    if (googleRes && googleRes.links && googleRes.links[0]) {
      const firstResult = googleRes.links[0].link;
      fetchFavicon(firstResult).then((r) => {
        const iconURL = r;
        iconController.createIcon(name, iconURL).catch((err) => {});
      }).catch((err) => {
        console.log(`Error processing image for: ${name}`);
      });
    }
  });
};

const getCategoryIcon = (cat) => {
  // console.log(cat);
  // console.log();
  const catgeoryUris = {
    Travel: 'https://img.icons8.com/ios-glyphs/90/000000/cab-left.png',
    Shops: 'https://img.icons8.com/material-outlined/96/000000/shop-department.png',
    Payroll: 'https://img.icons8.com/color/96/000000/bank.png',
    Transfer: 'https://img.icons8.com/ios-glyphs/90/000000/museum.png',
    Bicycles: 'https://img.icons8.com/windows/96/000000/bicycle.png',
    'Food and Drink': 'https://img.icons8.com/windows/96/000000/food.png',
    'Airlines and Aviation Services': 'https://img.icons8.com/windows/96/000000/airport.png',
    'Gyms and Fitness Centers': 'https://img.icons8.com/ios/100/000000/dumbbell-filled.png',
    'Coffee Shop': 'https://img.icons8.com/material-outlined/96/000000/cafe.png',


  };

  /*eslint-disable */
  for (const category of cat.reverse()) {
    if (Object.keys(catgeoryUris).indexOf(category) > -1) {
      return catgeoryUris[category];
    }
  }
  /* eslint-enable */

  // Default icon
  return 'https://img.icons8.com/material-outlined/96/000000/invoice.png';
};

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export const getTransactions = (req, res, attempt) => {
  const attemptNum = typeof attempt !== 'number' ? 1 : attempt;

  User.findById(
    req.user.id,
    (err, user) => {
      if (err) {
        res.status(422).send({ err });
      }
      const plaidClient = new plaid.Client(plaidClientId, plaidSecret, plaidPublic, plaid.environments.sandbox);
      const today = new Date();
      const endDateString = dateFormat(today, 'yyyy-mm-dd');
      plaidClient.getTransactions(user.accessToken, '2019-01-01', endDateString)
        .catch((error) => {
          if (attemptNum < 10) {
            sleep(500).then(() => {
              getTransactions(req, res, attemptNum + 1);
              Error('access token not found');
            });
          } else {
            res.status(422).send();
          }
          console.log(error);
        })
        .then(async (resAccess) => {
          const { transactions } = resAccess;
          const transactionsWithIcons = await Promise.all(transactions.map(async (transaction) => {
            const { name, category } = transaction;
            const icon = await iconController.getIcon(name);
            const transactionCopy = transaction;

            // No result
            if (icon.length === 0) {
              const uri = getCategoryIcon(category);
              transactionCopy.uri = uri;
            // asyncFetchIcon(transaction.name);
            } else {
              transactionCopy.uri = icon[0].uri;
            }

            return transactionCopy;
          }));
          const resCopy = resAccess;
          resCopy.transactions = transactionsWithIcons;
          res.send(resCopy);
        });
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
    const cashFlowDaily = {};
    const cashFlowDailyList = [];
    const outwardCashFlowDaily = {};
    const inwardCashFlowDaily = {};
    const outwardCashFlowDailyList = [];

    // TODO: We need to persist which accounts are tracked by the app
    const balanceAccounts = ['checking', 'savings'];

    // Get User ID for Plaid access token
    User.findById(
      user.id,
      (err, userObj) => {
        if (err) {
          res.status(422).send({ err });
        }

        // Build Plaid Client
        plaidClient = new plaid.Client(plaidClientId, plaidSecret, plaidPublic, plaid.environments.sandbox);

        // Get all transactions/balances for user
        plaidClient.getTransactions(userObj.accessToken, startDateString, endDateString).then((transactionsRes) => {
          const { accounts, transactions } = transactionsRes;

          // Build total current balance
          accounts.forEach((val) => {
            if (balanceAccounts.indexOf(val.subtype) > -1) {
              totalBalance += val.balances.current;
            }
          });

          // Calculate cash flow per day for transactions
          transactions.forEach((val) => {
            if (cashFlowDaily[val.date]) {
              cashFlowDaily[val.date] += val.amount;
            } else {
              cashFlowDaily[val.date] = val.amount;
            }
          });

          // Calculate outward cashflow per day
          transactions.forEach((val) => {
            if (val.amount > 0) {
              if (outwardCashFlowDaily[val.date]) {
                outwardCashFlowDaily[val.date] += val.amount;
              } else {
                outwardCashFlowDaily[val.date] = val.amount;
              }
            } else if (inwardCashFlowDaily[val.date]) {
              inwardCashFlowDaily[val.date] -= val.amount;
            } else {
              inwardCashFlowDaily[val.date] = val.amount * -1;
            }
          });

          // Convert cash flow objs to a sorted list of objects
          Object.keys(cashFlowDaily).forEach((key) => {
            cashFlowDailyList.push({ date: key, balance: cashFlowDaily[key] });
          });
          cashFlowDailyList.sort((a, b) => new Date(b.date) - new Date(a.date));

          // Update balances per day with actual balance
          const balancePerDay = cashFlowDailyList.map((val) => {
            totalBalance += val.balance;
            return { date: val.date, startBalance: totalBalance, flow: val.balance, endBalance: totalBalance - val.balance, outwardCashFlow: outwardCashFlowDaily[val.date], inwardCashFlow: inwardCashFlowDaily[val.date] };
          });


          res.send(balancePerDay);
        }).catch((error) => { console.log(error); });
      },
    );
  } else {
    res.send('Error, user ID or date missing or invalid');
  }
};

export const getLoanHistory = (req, res) => {
  console.log(req.user.id);
  Transfer.find({ user: req.user.id, type: { $ne: 'SUBSCRIPTION' } }, (err, docs) => {
    console.log('reached till here');
    console.log(docs);
    res.send(docs);
  }).catch((err) => { res.status(500).send({ err }); });
};

export const getCardsForUser = (req, res) => {
  CreditCard.find({ user: req.user.id }, (err, docs) => {
    res.send(cleanCreditCards(docs));
  }).catch((err) => { res.status(500).send({ err }); });
};
