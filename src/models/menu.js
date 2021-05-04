const { Schema, model } = require('mongoose');

const menuSchema = new Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  public_id: { type: String },
});

module.exports = model('Menu', menuSchema);
