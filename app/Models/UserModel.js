import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

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

UserSchema.methods.getUser = function getUser() {
  return {
    username: this.username,
    fullname: this.fullname,
  };
};

// create model class
const User = mongoose.model('User', UserSchema);

export default User;
