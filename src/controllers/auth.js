// Dependencies
const crypto = require('crypto');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Local variables
const User = require('../models/user');
const { smtpTransport } = require('../util');

async function register(req, res) {
  try {
    const { body } = req;
    if (!(body.fullname && body.email && body.password)) {
      return res
        .status(400)
        .send({ message: 'Los datos proporcionados no son válidos' });
    }
    // const errors = [];
    // if (!body.fullname || body.fullname.trim() === '') {
    //   errors.push('El nombre completo no puede estar vacío');
    // }
    // if (!body.email) {
    //   errors.push('El correo electrónico no puede estar vacío');
    // }
    // if (!body.password) {
    //   errors.push('La contraseña no puede estar vacía');
    // }
    // if (errors.length > 0) {
    //   return res
    //     .status(400)
    //     .send({ message: 'Datos no formateados correctamente', errors });
    // }
    const user = new User(body);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    user.saltSecret = salt;
    const doc = await user.save();
    res.status(201).send(doc);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      res.status(400).send({
        message: 'Se encontró una dirección de correo electrónico duplicada.',
      });
    } else {
      res.status(500).send({ message: err.message });
    }
  }
}

async function authenticate(req, res) {
  try {
    const { body } = req;
    const user = await User.findOne({ email: body.email });
    if (!user) {
      return res
        .status(400)
        .send({ message: 'El correo electrónico no está registrado' });
    }
    const matched = await bcrypt.compare(body.password, user.password);
    if (!matched) {
      return res.status(401).send({ message: 'Credenciales invalidas' });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXP,
    });
    return res.status(201).send({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

async function profile(req, res) {
  try {
    const user = await User.findOne({ _id: req._id });
    if (!user) {
      return res
        .status(404)
        .send({ status: false, message: 'User record not found.' });
    }
    return res.status(200).send({
      status: true,
      user: _.pick(user, ['fullname', 'email', 'id']),
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
      text: `You are receiving this because you (or someone else) have requested the reset 
      of the password for your account.\n\n Please click on the following link, or paste 
      this into your browser to complete the process:\n\n http://${host}/reset/${token} \n\n 
      If you did not request this, please ignore this email and your password will 
      remain unchanged.\n`,
    };
    await smtpTransport.sendMail(msg);
    res.status(200).send({
      message: `An e-mail has been sent to ${email} with further instructions.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
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
      text: `Hello, \n\n This is a confirmation that the password for your account 
      ${user.email} has just been changed.\n`,
    };
    await smtpTransport.sendMail(msg);
    res.status(200).send({
      message: 'Success! Your password has been changed.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

module.exports = { register, authenticate, profile, putForgot, putReset };
