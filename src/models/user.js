const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new Schema({
  fullname: {
    type: String,
    required: 'El campo Nombre Completo no puede estar vacío.',
  },
  email: {
    type: String,
    required: 'Email cant be empty!',
    unique: true,
  },
  password: {
    type: String,
    required: 'Password cant be empty!',
    minlength: [4, 'Password must be atleast 4 character long'],
  },
  saltSecret: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  avatar: String,
});

// Custom validation for email
UserSchema.path('email').validate((val) => {
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(val);
}, 'Invalid e-mail.');

// Events
UserSchema.pre('save', (next) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(this.password, salt, (_err, hash) => {
      this.password = hash;
      this.saltSecret = salt;
      next();
    });
  });
});

// Methods
UserSchema.methods.verifyPassword = (password) => {
  return new Promise((resolve, reject) => {
    const match = bcrypt.compareSync(password, this.password);
    if (!match) {
      reject(match);
    }
    resolve(match);
  });
};

UserSchema.methods.generateJwt = () => {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP,
  });
};

module.exports = model('User', UserSchema);
