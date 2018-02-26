const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Latest = new Schema({
   symbol: String,
   labels: [String],
   ClosePrices: [Number]
});

module.exports = mongoose.model('Latest', Latest);
