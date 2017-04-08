var mongoose = require('mongoose');

var stateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  keywords: [{ keyword: String, score: Number }]
});

var State = mongoose.model('State', stateSchema);

module.exports = State;
