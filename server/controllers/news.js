const News = require('../models/news.js');

class NewsController {

  static async getAllNewsList(ctx) {
    let result;
    let page = +ctx.query.page;
    let limit = +ctx.query.limit || 5;
    if (page <= 0) {
      page = 1;
    }
    if (page && limit) {
      result = await News
        .find()
        .sort({ 'createTime': -1 })
        .skip(limit * (page - 1))
        .limit(limit)
        .populate('tags')
        .exec()
        .catch(err => {
          ctx.throw(500, '服务器内部错误-分页查找错误!');
        });
      total = await News
        .count()
        .exec()
        .catch(err => {
          ctx.throw(500, '服务器内部错误-总数查询错误!')
        });
    } else {  //当没传递任何参数时，查询所有文章，包括发布和未发布的
      result = await News
        .find()
    }
    ctx.success({
      msg: '查询文章成功！',
      data: result,
    });
  }
  
}

exports = module.exports = NewsController;