const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Option = new Schema({
  name: String,
  selected: Number
});

const Poll = new Schema({
  title: String,
  options: [Option],
  ip: [String]
});


const User = new Schema({
	github: {
		id: String,
		displayName: String,
		username: String,
    publicRepos: Number
	},
   polls: [Poll]
});

module.exports = mongoose.model('User', User);
