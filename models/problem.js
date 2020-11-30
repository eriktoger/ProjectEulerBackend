const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  shortName: {
    type: String,
    required: true,
    unique: true,
  },
  longName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  hints: {
    type: Array,
    default: [],
  },
  answer: {
    type: String,
    required: true,
  },
  solution: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Problem", problemSchema);
