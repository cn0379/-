/*
 * @Author: your name
 * @Date: 2021-03-31 12:45:12
 * @LastEditTime: 2021-03-31 12:47:54
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \koa2-blog-server\passport.js
 */
'use strict';

/*!
 * Module dependencies.
 */

const mongoose = require('mongoose');
const User = mongoose.model('User');


/**
 * Expose
 */

module.exports = function (passport) {

  // serialize sessions
  passport.serializeUser((user, cb) => cb(null, user.id));
  passport.deserializeUser((id, cb) => User.load({ criteria: { _id: id } }, cb));

};
