import mongoose, { Schema } from 'mongoose';

// Base credit card schema
const CreditCardSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  number: Number,
  name: String,
  exp: Number,
  address: String,
  default: Boolean,
});

CreditCardSchema.set('toJSON', {
  virtuals: true,
});

// Pre-save hook left in case we want to validate card number before saving
// CreditCardSchema.pre('save', function beforeUserSave(next) {
//
// });

// Create model class
const User = mongoose.model('User', CreditCardSchema);

export default User;
