const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const chalk = require('chalk');

// The master process will fork a process for each CPU
if (cluster.isMaster) {
  // Let us know how many CPUs we're distributing amongst
  console.log(`Running with ${chalk.hex('#009688')(numCPUs)} cpus`);
  for (let n = 0; n < numCPUs; n++) {
    cluster.fork();
  }

  // Exit callback
  cluster.on('exit', (worker) => {
    console.log(`Server worker with PID: ${worker.process.pid} exited`);
  });
} else {
  // If a worker, import our server entry point
  /*eslint-disable */
  require('./app.js');
  /* eslint-enable */
}
