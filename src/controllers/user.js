const User = require('../models/user');

async function findAll(req, res) {
  const users = await User.find();
  res.json(users);
}

async function findById(req, res) {
  const user = await User.findById(req.params.id);
  res.json(user);
}

async function update(req, res, next) {
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
        if (err.code === 11000) {
          res.status(422).send(['Duplicate email adrress found.']);
        } else {
          return next(err);
        }
      }
    }
  );
}

module.exports = { findAll, findById, update };
