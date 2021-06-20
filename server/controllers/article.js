const Atricle = require("../models/atricle.js");

class AtricleController {
  static async insertAtricle(ctx) {
    let result;
    let a = new Atricle(ctx.request.body)
    result = await a.save();
    ctx.success({
      msg: '插入文章成功！',
      code: '0000',
    });
  }

  static async getAtricle(ctx) {
    let result;
    const { limit, page } = ctx.query
    result = await Atricle.find().limit(parseInt(limit))
    ctx.success({
      msg: '查询文章成功！',
      data: result,
      total: await (await Atricle.find()).length
    });
  }
}

exports = module.exports = AtricleController;
