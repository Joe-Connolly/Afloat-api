import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import requestIp from 'request-ip';
import routes from './rest';
import chalk from 'chalk';
import mongoose from './mongoose';

/**
 * @name init
 */
const HOST = '0.0.0.0';
const PORT = 3000;
const app = express();

/**
 * @name middleware-functions
 */
app.use(compression());
app.use(helmet());
app.use(cors());

// Get IPs
app.use(requestIp.mw());
app.set('trust proxy', true);

app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * @name REST
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
