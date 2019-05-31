import { Router } from 'express';
import auth from './auth';
import * as UserController from '../Controllers/UserController';
import * as TransactionController from '../Controllers/TransactionController';
import * as CreditCardController from '../Controllers/CreditCardController';
// import * as HeadlessController from '../Controllers/HeadlessController';
import * as BankController from '../Controllers/BankController';
import { updateOnPRClose } from '../Controllers/GitWebhookController';

const router = Router();


router.get('/', (req, res) => {
  res.send('Hello, world!');
});


// Restart server route (only GitHub closing PRs has access)
router.post('/getGitUpdate', updateOnPRClose);

// Login routes
router.post('/signup', auth.optional, UserController.signup);
router.post('/signin', auth.optional, UserController.signin);
router.post('/updateEmail', auth.required, UserController.updateEmail);
router.get('/getUser', auth.required, UserController.getUser);


// Transaction routes
router.post('/createTransaction', auth.required, TransactionController.createTransaction);
router.post('/createOrder', auth.required, TransactionController.createOrder);
router.post('/razorpayWebhook', TransactionController.razorpayWebhook);
router.get('/getTransactionsForUser', auth.required, TransactionController.getTransactionsForUser);


// Credit Card routes
router.post('/addCard', auth.required, CreditCardController.addCard);
router.get('/getCards', auth.required, CreditCardController.getCardsForUser);

// Bank Account Headless Browser routes
// router.post('/addBank', auth.required, HeadlessController.addBankForUser);

// Bank account routes
router.get('/getTransactions', auth.required, BankController.getTransactions);
router.post('/addBank', auth.required, BankController.addBank);
router.post('/transferToUser', auth.required, BankController.transferAchToUser);
router.post('/enrollSubscription', auth.required, BankController.enrollSubscription);
router.post('/getBalanceRange', auth.required, BankController.getBalanceRange);
router.get('/getLoanHistory', auth.required, BankController.getLoanHistory);
router.post('/transferToApp', auth.required, BankController.transferAchFromUser);


// -----> Example protected route
router.get('/testProtectedRoute', auth.required, (req, res) => {
  // We can use these to query the DB for records for a user
  const userEmail = req.user.email;
  const userId = req.user.id;

  // Do protected things here for the userId

  // Send result
  res.json({ userEmail, userId });
});

export default router;
