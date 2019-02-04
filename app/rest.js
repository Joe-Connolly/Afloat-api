import { Router } from 'express';

import auth from './auth';
import * as UserController from './Controllers/UserController';

const router = Router();


router.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Login routes
router.post('/signup', auth.optional, UserController.signup);
router.post('/signin', auth.optional, UserController.signin);

export default router;
