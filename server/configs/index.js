/*
 * @Author: your name
 * @Date: 2021-03-31 09:39:48
 * @LastEditTime: 2021-04-17 21:41:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \koa2-blog-server\configs\index.js
 */
let config = {
   admin: {
       username: '',           
       password: '',
       name: ''            
   },
   jwt: {
       secret: 'secret',            
       exprisesIn: '3600s'          // 以秒为单位
   },
   mongodb: {
       host: '127.0.0.1',
       database: 'blog',
       port: 27017,
       user: '',                    // 非必填
       password: ''                 // 非必填
   },
   app: {
       port: process.env.PORT || 4000,
       routerBaseApi: '/api'
   }
};


module.exports = config;