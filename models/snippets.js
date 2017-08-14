const mongoose = require('mongoose');

let snippetSchema = new mongoose.Schema({
  creator: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  notes: String,
  language: String,
  tags: [],
  createdAt: {
    type: String,
    required: true
  }
});

let Snippet = mongoose.model('Snippet', snippetSchema);

module.exports = Snippet;
