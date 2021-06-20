/*
 * @Author: zhangshaolong
 * @Date: 2021-04-18 22:37:58
 * @LastEditTime: 2021-06-05 17:33:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \koa2-blog-server\models\news.js
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsSchema = new Schema({
});

exports = module.exports = mongoose.model('newslist', newsSchema);