/*
 * @Author: your name
 * @Date: 2021-03-31 13:26:08
 * @LastEditTime: 2021-05-16 16:46:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \koa2-blog-server\models\user.js
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const atricleSchema = new Schema({
    title: String,
    content: String,
    author: String,
});

exports = module.exports = mongoose.model('Atricle', atricleSchema);
