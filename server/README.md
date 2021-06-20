### 项目构建
---

如下

```
.
├── README.md 项目描述
├── app  业务侧代码
│   ├── controller 与路由关联的api方法
│   └── modal 数据模型
├── app.js 入口文件
├── config 配置文件
│   ├── index.js 数据库等服务的一些配置
│   ├── logConfig.js 日志配置 
├── logs  日志目录
│   ├── error 错误日志
│   └── response 普通响应日志 
├── middlewares  中间件
│   └── checkToken.js  生产token中间件
│   └── checkToken.js  错误信息中间件
│   └── checkToken.js  请求成功中间件
├── public
│   └── stylesheets 公用文件
├── models Schema
│   ├── user.js 用户的一些操作
├── routes  路由
│   ├── index.js 路由入口配置
├── utils 公用方法
│   ├── createToken.js创建token 
│   └── mkdir.js
├── views 页面层
│   ├── error.jade
│   ├── index.jade
│   └── layout.jade
└── package.json
```