import mongoose from 'mongoose';

// TODO: Use environment variable
const MONGODB_URI = 'mongodb://quantweb:spacejam98@ds221095.mlab.com:21095/quantweb';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true });
mongoose.Promise = global.Promise;

export default mongoose;
