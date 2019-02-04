import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// email: unique identifier
// fullname: could do first + last, but just one object for now
// password: gets hashed with bcryptjs
const UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  fullname: String,
  password: String,
});

UserSchema.set('toJSON', {
  virtuals: true,
});

UserSchema.pre('save', function beforeUserSave(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, 8, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    return next();
  });
});

UserSchema.methods.comparePassword = function comparePassword(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, result);
    }
  });
};

// Adapted from: https://medium.freecodecamp.org/learn-how-to-handle-authentication-with-node-using-passport-js-4a56ed18e81e
UserSchema.methods.generateJWT = function generateJWT() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign({
    email: this.email,
    id: this._id,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, 'secret');
};

UserSchema.methods.toAuthJSON = function toAuthJSON() {
  return {
    _id: this._id,
    email: this.email,
    token: this.generateJWT(),
  };
};

UserSchema.methods.getUser = function getUser() {
  return {
    username: this.username,
    fullname: this.fullname,
  };
};

// create model class
const User = mongoose.model('User', UserSchema);

export default User;
