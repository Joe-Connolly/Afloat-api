import * as ENV from '../env';

const jwt = require('express-jwt');

const { SECRET } = ENV;

// Adapted from https://medium.freecodecamp.org/learn-how-to-handle-authentication-with-node-using-passport-js-4a56ed18e81e
const getTokenFromHeaders = (req) => {
  const { headers: { authorization } } = req;
  if (authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }
  return null;
};

const auth = {
  required: jwt({
    secret: SECRET,
    userProperty: 'user',
    getToken: getTokenFromHeaders,
  }),
  optional: jwt({
    secret: SECRET,
    userProperty: 'user',
    getToken: getTokenFromHeaders,
    credentialsRequired: false,
  }),
};

module.exports = auth;
