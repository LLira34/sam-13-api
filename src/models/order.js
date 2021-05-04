const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: Number,
  items: [{ type: Schema.Types.ObjectId, ref: 'Menu' }],
  date: { type: Date, default: Date.now() },
});

module.exports = model('Order', orderSchema);
