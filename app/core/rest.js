import { Router } from 'express';
import verifyGithubWebhook from 'verify-github-webhook';

import auth from './auth';
import * as UserController from '../Controllers/UserController';

const router = Router();


router.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Login routes
router.post('/signup', auth.optional, UserController.signup);
router.post('/signin', auth.optional, UserController.signin);

// asdfkj98123792134ASDJKH
router.post('/getGitUpdate', (req, res) => {
  console.log(req.body);
  // console.log();
  // console.log();
  // console.log(req.headers);
  // console.log();
  // console.log();

  const signature = req.headers['x-hub-signature'];
  const payload = JSON.stringify(req.body.payload);
  const secret = 'asdfkj98123792134ASDJKH';

  console.log(`Signature: ${signature}`);
  console.log(`payload: ${payload}`);
  console.log('secret: asdfkj98123792134ASDJKH');
  console.log(`action: ${req.body.payload.action}`);
  console.log(`Test 0: ${verifyGithubWebhook(signature, req.body.payload, secret)}`)
  console.log(`Test 1: ${verifyGithubWebhook(signature, payload, secret)}`)


  // console.log(JSON.stringify(req.body));
  // if (req.body.payload.action === 'closed' && verifyGithubWebhook(signature, payload, secret)) {
  //   console.log('Git pull and reset the server');
  // }
  res.send('success');
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
