const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Stock = new Schema({
   symbol: String,
   labels: [String],
   ClosePrices: [Number]
});

module.exports = mongoose.model('Stock', Stock);
