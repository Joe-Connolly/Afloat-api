import mongoose, { Schema } from 'mongoose';

// Base credit card schema
const IconSchema = new Schema({
  name: { type: String, unique: true },
  uri: String,
});

IconSchema.set('toJSON', {
  virtuals: true,
});


// Create model class
const Icon = mongoose.model('Icon', IconSchema);

export default Icon;
