const fs = require('fs-extra');
const Menu = require('../models/menu');
const cloudinary = require('../util/cloudinary');

/**
 * Método para listar todos los registros con paginación
 *
 * @param {Request} req objeto que contiene información sobre la solicitud HTTP
 * @param {Response} res objeto que devuelve información sobre la respuesta HTTP
 */
async function findAll(req, res) {
  try {
    const menus = await Menu.find();
    res.status(200).send(menus);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

async function findById(req, res) {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);
    if (menu) {
      res.status(200).send(menu);
    } else {
      res.status(404).send({
        message: `No se encontró el menu con id: ${id}`,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

/**
 * Método para insertar un menu
 *
 * @param {Request} req objeto que contiene información sobre la solicitud HTTP
 * @param {Response} res objeto que devuelve información sobre la respuesta HTTP
 */
async function insert(req, res) {
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const menu = new Menu({
      type: req.body.type,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: result.secure_url,
      public_id: result.public_id,
    });
    await menu.save();
    await fs.unlink(req.file.path);
    res.status(201).send({
      message: 'El Menu se creó con éxito.',
    });
  } catch (err) {
    if (req.file) {
      await fs.unlink(req.file.path);
    }
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const data = await Menu.findById(id);
    let menu;
    if (req.file) {
      await cloudinary.v2.uploader.destroy(data.public_id);
      const upload = await cloudinary.v2.uploader.upload(req.file.path);
      menu = {
        type: req.body.type,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        image: upload.secure_url,
        public_id: upload.public_id,
      };
    } else {
      menu = {
        type: req.body.type,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
      };
    }
    // TODO - Revisar esta parte
    await Menu.findByIdAndUpdate(id, { $set: menu }, { new: true });
    if (!menu) {
      res.status(404).send({
        message: `No se puede actualizar el menu con id: ${id}.`,
      });
    } else {
      res.status(200).send({
        message: 'El menu se actualizó con éxito.',
      });
    }
    if (req.file) {
      await fs.unlink(req.file.path);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}

async function destroy(req, res) {
  try {
    const { id } = req.params;
    const menu = await Menu.findByIdAndRemove(id);
    if (!menu) {
      res.status(404).send({
        message: `No se puede eliminar el menu con id: ${id}.`,
      });
    } else {
      await cloudinary.v2.uploader.destroy(menu.public_id);
      res.status(200).send({
        message: 'El menu se eliminó con éxito.',
      });
    }
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
