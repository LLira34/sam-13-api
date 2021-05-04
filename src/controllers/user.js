const User = require('../models/user');
const passport = require('passport');
const _ = require('lodash');
const userCtrl = {};
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');

userCtrl.register = async (req, res, next) => {
  const user = new User({
    fullname: req.body.fullname,
    email: req.body.email,
    password: req.body.password,
  });
  await user.save((err, doc) => {
    if (!err) res.send(doc);
    else {
      console.log(err);
      if (err.code == 11000)
        res.status(422).send(['Duplicate email adrress found.']);
      else return next(err);
    }
  });
};

userCtrl.authenticate = (req, res, next) => {
  // call for passport authentication
  passport.authenticate('local', (err, user, info) => {
    // error from passport middleware
    if (err) return res.status(400).json(err);
    // registered user
    else if (user) return res.status(200).json({ token: user.generateJwt() });
    // unknown user or wrong password
    else return res.status(404).json(info);
  })(req, res);
};

userCtrl.userProfile = (req, res, next) => {
  User.findOne({ _id: req._id }, (err, user) => {
    if (!user)
      return res
        .status(404)
        .json({ status: false, message: 'User record not found.' });
    else
      return res.status(200).json({
        status: true,
        user: _.pick(user, ['fullname', 'email', 'avatar', '_id']),
      });
  });
};

// CRUD methods
userCtrl.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};
userCtrl.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
};
userCtrl.editUser = async (req, res, next) => {
  const { id } = req.params;
  const user = {
    fullname: req.body.fullname,
    email: req.body.email,
    password: req.body.password,
    avatar: req.body.avatar,
  };
  await User.findByIdAndUpdate(
    id,
    { $set: user },
    { new: true },
    (err, doc) => {
      if (!err) res.send(doc);
      else {
        console.log(err);
        if (err.code == 11000)
          res.status(422).send(['Duplicate email adrress found.']);
        else return next(err);
      }
    }
  );
};

// FORGOT PASSWORD
userCtrl.getForgot = (req, res) => {
  res.json({ status: 'Get forgot' });
};
userCtrl.postForgot = (req, res, next) => {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },

      function (token, done) {
        User.findOne({ email: req.body.email }, function (err, user) {
          if (!user) {
            //req.flash('error', 'No account with that email address exists.');//cambiar
            console.log('No account with that email address exists.');
            return res.redirect('/api/forgot');
          }
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          user.save(function (err) {
            done(err, token, user);
          });
        });
      },

      function (token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
          },
        });
        //req.headers.host
        var host = req.headers.host;
        var host_local = 'localhost:4200';
        var mailOptions = {
          to: user.email,
          from: process.env.GMAIL_USER,
          subject: 'SAM 13 Password Reset',
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
        smtpTransport.sendMail(mailOptions, function (err) {
          //req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');//cambiar
          console.log(
            'An e-mail has been sent to ' +
              user.email +
              ' with further instructions.'
          );
          done(err, 'done');
        });
      },
    ],
    function (err) {
      if (err) return next(err);
      res.redirect('/api/forgot');
    }
  );
};

/* RESET PASSWORD */
userCtrl.getReset = (req, res) => {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    function (err, user) {
      if (!user) {
        //req.flash('error', 'Password reset token is invalid or has expired.');
        console.log('Password reset token is invalid or has expired');
        //return res.redirect('/');
      }
      res.render('reset', {
        user: req.user,
      });
    }
  );
};
userCtrl.postReset = (req, res) => {
  async.waterfall(
    [
      function (done) {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
          },
          function (err, user) {
            if (!user) {
              //req.flash('error', 'Password reset token is invalid or has expired.');
              console.log('Password reset token is invalid or has expired.');
              return console.log('Nel!');
            }
            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            user.save(function (err) {
              req.logIn(user, function (err) {
                done(err, user);
              });
            });
          }
        );
      },
      function (user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
          },
        });
        var mailOptions = {
          to: user.email,
          from: process.env.GMAIL_USER,
          subject: 'Your password has been changed',
          text:
            'Hello,\n\n' +
            'This is a confirmation that the password for your account ' +
            user.email +
            ' has just been changed.\n',
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          //req.flash('success', 'Success! Your password has been changed.');
          console.log('Success! Your password has been changed.');
          done(err);
        });
      },
    ],
    function (err) {
      //res.redirect('/');
    }
  );
};

module.exports = userCtrl;
