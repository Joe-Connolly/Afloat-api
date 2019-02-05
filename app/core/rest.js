import { Router } from 'express';
import verifyGithubWebhook from 'verify-github-webhook';
import crypto from 'crypto';
import auth from './auth';
import * as UserController from '../Controllers/UserController';
import { SECRET } from '../env';
const router = Router();


router.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Login routes
router.post('/signup', auth.optional, UserController.signup);
router.post('/signin', auth.optional, UserController.signin);

// Restart server route (only GitHub closing PRs has access)
router.post('/getGitUpdate', (req, res) => {
  const payload = req.body;
  const hmac = crypto.createHmac('sha1', SECRET);
  hmac.update(JSON.stringify(payload));
  const calculatedSignature = `sha1=${hmac.digest('hex')}`;

  console.log();
  console.log(payload['action']);
  console.log();

  if (req.headers['x-hub-signature'] === calculatedSignature) {
    res.send('success');
  } else {
    res.send('failure');
  }
});

// Test restart
router.get('/lol', (req, res) => {
  res.send('you win!');
});

// Sample protected route
router.get('/testProtectedRoute', auth.required, (req, res) => {
  // We can use these to query the DB for records for a user
  const userEmail = req.payload.email;
  const userId = req.payload.id;

  // Do protected things here for the userId

  // Send result
  res.json({ userEmail, userId });
});

export default router;
