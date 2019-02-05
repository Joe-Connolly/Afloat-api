import { Router } from 'express';
import verifyGithubWebhook from "verify-github-webhook";

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
  console.log();
  console.log();
  console.log(JSON.stringify(req.body);
  if (req.body.payload.action === 'closed') {
    console.log('Git pull and reset the server');
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
