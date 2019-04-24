import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import requestIp from 'request-ip';
import chalk from 'chalk';
import session from 'express-session';
import passport from './core/passport';


import { SECRET, HOST, PORT } from './env';
import routes from './core/rest';
import mongoose from './core/mongoose';
import { subscriptionScheduler } from './Controllers/BankController';

/**
 * @name init
 */
const app = express();

subscriptionScheduler();

/**
 * @name middleware-functions
 */
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(requestIp.mw());
app.set('trust proxy', true);
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: SECRET, cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
/**
 * @name REST-entry-point
 */
app.use('/api', routes);


/**
 * @name api-server
 */
const server = app.listen(Number(PORT), HOST, () => {
  console.log(chalk.hex('#009688')(` [*] Host: http://${HOST}:${PORT}/.`));
  mongoose.connection.once('open', () => console.log(chalk.hex('#009688')(' [*] Mongo: Connection Succeeded.')));
  mongoose.connection.on('error', err => console.error(err));
});

export default server;
