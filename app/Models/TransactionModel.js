import mongoose, { Schema, mongo } from 'mongoose';

// Base credit card schema
const TransactionSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transactionId: String,
  amount: Number,
  status: String,
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'CreditCard' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },
  date: Date,
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
