import mongoose from 'mongoose';
import * as ENV from '../env';

const { MONGODB_URI } = ENV;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true });
mongoose.Promise = global.Promise;

export default mongoose;
