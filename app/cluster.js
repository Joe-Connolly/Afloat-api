import { distribute } from './core/distributeServer';

// Call the distribute function on our server entry point
// Will run our server across each core of the host machine
distribute('./app.js');
