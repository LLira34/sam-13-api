const cloudinary = require('cloudinary');
const fs = require('fs-extra');
const Menu = require('../models/menu');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function findAll(req, res) {
  try {
    const findAll = await Menu.find();
    res.json(findAll);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

async function insert(req, res) {
  try {
    const { type, name, description, price } = req.body;
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const menu = new Menu({
      type,
      name,
      description,
      price,
      image: result.url,
      public_id: result.public_id,
    });
    await menu.save();
    await fs.unlink(req.file.path);
    res.json({ status: 'Menu saved!' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

async function findById(req, res) {
  try {
    const menu = await Menu.findById(req.params.id);
    res.status(200).send(menu);
  } catch (error) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const menu = {
      type: req.body.type,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
    };
    await Menu.findByIdAndUpdate(id, { $set: menu }, { new: true });
    res.status(200).send({ status: 'Se actualizó el menu correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

async function destroy(req, res) {
  try {
    const menu = await Menu.findByIdAndRemove(req.params.id);
    const result = await cloudinary.v2.uploader.destroy(menu.public_id);
    console.log(result);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

module.exports = {
  findAll,
  findById,
  insert,
  update,
  destroy,
};
