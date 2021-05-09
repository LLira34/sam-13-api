const { Schema, model } = require('mongoose');

const HistorySchema = new Schema({
  date: { type: Date, default: Date.now() },
});

module.exports = model('History', HistorySchema);
