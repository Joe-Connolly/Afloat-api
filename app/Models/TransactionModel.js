import mongoose, { Schema } from 'mongoose';

// Base credit card schema
const TransactionSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentId: { type: String, unique: true },
  amount: Number,
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'CreditCard' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },
  status: String,
  date: { type: Date, default: Date.now },
});

TransactionSchema.set('toJSON', {
  virtuals: true,
});

// Pre-save hook left in case we want to validate card number before saving
// TransactionSchema.pre('save', function beforeCreditCardSave(next) {
//
// });

// Create model class
const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;
