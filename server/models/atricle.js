
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const atricleSchema = new Schema({
    title: String,
    content: String,
    author: String,
});

exports = module.exports = mongoose.model('Atricles', atricleSchema);
