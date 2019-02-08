import { Router } from 'express';
import auth from './auth';
import * as UserController from '../Controllers/UserController';
import * as TransactionController from '../Controllers/TransactionController';
import * as CreditCardController from '../Controllers/CreditCardController';
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
router.get('/getUser', auth.required, UserController.getUser);

// Transaction routes
router.post('/createTransaction', auth.required, TransactionController.createTransaction);
router.get('/getTransactionsForUser', auth.required, TransactionController.getTransactionsForUser);

// Credit Card routes
router.post('/addCard', auth.required, CreditCardController.addCard);
router.get('/getCards', auth.required, CreditCardController.getCardsForUser);

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