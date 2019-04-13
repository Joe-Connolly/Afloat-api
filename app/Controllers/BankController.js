import crypto from 'crypto';
import shell from 'shelljs';
import { SECRET } from '../env';

// This method validates a payload and SHA-1 key from GitHub
// If the call is authed and the event is a PR being closed,
// execute update script, which: pulls from master, reinstalls
// dependencies, rebuilds production directory, and triggers a
// restart of the server with the updated code
export const updateOnPRClose = (req, res) => {
  const payload = req.body;
  const hmac = crypto.createHmac('sha1', SECRET);
  hmac.update(JSON.stringify(payload));
  const calculatedSignature = `sha1=${hmac.digest('hex')}`;

  // If the request is from GitHub (SHA-1 hash matches secret key) AND the PR is 'closed'
  // then run './updateCode', which pulls from master, npm installs, and restarts the server
  if (req.headers['x-hub-signature'] === calculatedSignature && payload.action === 'closed') {
    if (shell.exec('./updateCode').code === 0) {
      res.send('Success');
      process.exit();
    }
  } else {
    res.send('failure');
  }
};
