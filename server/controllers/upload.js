/*
 * @Author: your name
 * @Date: 2021-06-05 16:39:16
 * @LastEditTime: 2021-06-12 10:37:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \project\controllers\upload.js
 */
const multer = require('@koa/multer')

var storage = multer.diskStorage({
  //文件保存路径
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  //修改文件名称
  filename: function (req, file, cb) {
    console.log(6666);
    var fileFormat = (file.originalname).split(".");  //以点分割成数组，数组的最后一项就是后缀名
    cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
})
var upload = multer({ storage: storage });

exports = module.exports = upload;
