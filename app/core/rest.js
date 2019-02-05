import { Router } from 'express';
import crypto from 'crypto';
import shell from 'shelljs';
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

router.get('/t', (req, res) => {
  if (shell.exec('./updateCode').code === 0) {
    res.send('Success');
    process.exit();
  }
});

// Restart server route (only GitHub closing PRs has access)
router.post('/getGitUpdate', (req, res) => {
  const payload = req.body;
  const hmac = crypto.createHmac('sha1', SECRET);
  hmac.update(JSON.stringify(payload));
  const calculatedSignature = `sha1=${hmac.digest('hex')}`;

  if (req.headers['x-hub-signature'] === calculatedSignature && payload.action === 'closed') {
    console.log('Restarting server...');
    if (shell.exec('./updateCode').code === 0) {
      res.send('Success');
      process.exit();
    }
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
