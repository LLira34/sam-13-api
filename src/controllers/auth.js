// Dependencies
const crypto = require('crypto');
const _ = require('lodash');
const passport = require('passport');
// Local variables
const User = require('../models/user');
const { smtpTransport } = require('../util');

async function register(req, res) {
  try {
    const user = new User({
      fullname: req.body.fullname,
      email: req.body.email,
      password: req.body.password,
    });
    const doc = await user.save();
    res.status(201).send(doc);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

async function authenticate(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(400).send(err);
    } else if (user) {
      const token = await user.generateJwt();
      return res.status(200).send({ token });
    } else {
      return res.status(404).send(info);
    }
  })(req, res);
}

async function profile(req, res) {
  try {
    const user = await User.findOne({ _id: req._id });
    if (!user)
      return res
        .status(404)
        .send({ status: false, message: 'User record not found.' });
    else
      return res.status(200).send({
        status: true,
        user: _.pick(user, ['fullname', 'email', 'avatar', '_id']),
      });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

async function putForgot(req, res) {
  try {
    const token = crypto.randomBytes(20).toString('hex');
    const { email } = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'No account with that email.' });
    }
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    // req.headers.host;
    const host = process.env.APP_URL;
    await user.save();
    const msg = {
      to: email,
      from: 'SAM 13 Admin <sam13@sam13.com>',
      subject: 'SAM 13 - Forgot Password / Reset',
      text:
        'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' +
        host +
        '/reset/' +
        token +
        '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n',
    };
    await smtpTransport.sendMail(msg);
    res.status(200).send({
      message: `An e-mail has been sent to ${email} with further instructions.`,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e.error });
  }
}

async function putReset(req, res) {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(404).send({
        message: 'Password reset token is invalid or has expired',
      });
    }
    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    const msg = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Your password has been changed',
      text:
        'Hello,\n\n' +
        'This is a confirmation that the password for your account ' +
        user.email +
        ' has just been changed.\n',
    };
    await smtpTransport.sendMail(msg);
    res.status(200).send({
      message: 'Success! Your password has been changed.',
    });
  } catch (e) {
    res.status(500).send({ message: e.error.message });
  }
}

module.exports = { register, authenticate, profile, putForgot, putReset };
