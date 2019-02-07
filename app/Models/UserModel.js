import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as ENV from '../env';

const { SECRET } = ENV;

// Base user schema
const UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  fullname: String,
  username: String,
  password: String,
  phone: String,
  transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
});

UserSchema.set('toJSON', {
  virtuals: true,
});

// Pre-save hook to salt and hash password updates
UserSchema.pre('save', function beforeUserSave(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, 8, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    return next();
  });
  return 'error';
});

// Schema method to compare/validate hashed password
UserSchema.methods.comparePassword = function comparePassword(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, result);
    }
  });
};

// Schema method to generate a json web token for auth
// Adapted from: https://medium.freecodecamp.org/learn-how-to-handle-authentication-with-node-using-passport-js-4a56ed18e81e
UserSchema.methods.generateJWT = function generateJWT() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 90);

  return jwt.sign({
    email: this.email,
    id: this._id,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, SECRET);
};

// Schema method to return auth JSON body (including auth token)
UserSchema.methods.toAuthJSON = function toAuthJSON() {
  return {
    _id: this._id,
    email: this.email,
    token: this.generateJWT(),
  };
};

// Schema method to get JSON representation of user
UserSchema.methods.getUser = function getUser() {
  return {
    username: this.username,
    fullname: this.fullname,
  };
};

// Create model class
const User = mongoose.model('User', UserSchema);

export default User;
