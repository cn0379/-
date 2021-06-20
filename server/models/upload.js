/*
 * @Author: your name
 * @Date: 2021-06-05 16:56:06
 * @LastEditTime: 2021-06-05 17:33:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \project\models\upload.js
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const uploadSchema = new Schema({
  title: String,
});

exports = module.exports = mongoose.model('Atricle', uploadSchema);