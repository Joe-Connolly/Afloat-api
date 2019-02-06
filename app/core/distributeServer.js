import path from 'path';

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const chalk = require('chalk');


// Method takes a file path and distributes it across each core of the host machine
//  - entryFilePath: a '*.js' file that points to an "entry point" of an app to be distributed
export const distribute = (entryFilePath) => {
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
    const callerDirectory = path.dirname(module.parent.filename);
    const filePath = path.resolve(callerDirectory, entryFilePath);
    /*eslint-disable */
    // require('./app.js');
    require(filePath);
    /* eslint-enable */
  }
};
