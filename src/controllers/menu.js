const Menu = require('../models/menu');
const cloudinary = require('cloudinary');
const menuCtrl = {};
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const fs = require('fs-extra');

menuCtrl.findAll = async (req, res) => {
  const findAll = await Menu.find();
  res.json(findAll);
};

menuCtrl.createMenu = async (req, res) => {
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
};

menuCtrl.getMenu = async (req, res) => {
  const menu = await Menu.findById(req.params.id);
  res.json(menu);
};

menuCtrl.editMenu = async (req, res) => {
  const { id } = req.params;
  const menu = {
    type: req.body.type,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
  };
  await Menu.findByIdAndUpdate(id, { $set: menu }, { new: true });
  res.json({ status: 'Menu updated!' });
};

menuCtrl.deleteMenu = async (req, res) => {
  const menu = await Menu.findByIdAndRemove(req.params.id);
  const result = await cloudinary.v2.uploader.destroy(menu.public_id);
  console.log(result);
  res.json({ status: 'Menu deleted!' });
};

module.exports = menuCtrl;
