import mongoose, { Schema } from 'mongoose';

// Base credit card schema
const CreditCardSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  number: Number,
  name: String,
  exp: Number,
  address: String,
});

CreditCardSchema.set('toJSON', {
  virtuals: true,
});

// Pre-save hook left in case we want to validate card number before saving
// CreditCardSchema.pre('save', function beforeCreditCardSave(next) {
//
// });

// Create model class
const CreditCard = mongoose.model('CreditCard', CreditCardSchema);

export default CreditCard;
