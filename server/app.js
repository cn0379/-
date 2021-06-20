/**
 * 服务入口
 */
var http = require('http');
var koaStatic = require('koa-static');
var path = require('path');
var koaBody = require('koa-body');
var fs = require('fs');
const fse = require("fs-extra");
var Koa = require('koa2');
const Router = require("koa-router");
const router = new Router();
const extractExt = filename =>
    filename.slice(filename.lastIndexOf("."), filename.length); // 提取后缀名

var app = new Koa();
var port = process.env.PORT || '8100';

//允许跨域
app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', ctx.headers.origin);
    ctx.set("Access-Control-Max-Age", 864000);
    ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
    ctx.set("Access-Control-Allow-Headers", "x-requested-with, accept, origin, content-type");
    await next();
})

app.use(router.routes()).use(router.allowedMethods());

router.post('/verify', async ctx => {
    console.log('verify');
    const resD = fse.readdir(path.resolve(path.resolve(__dirname, './public/images')));
    const data = await resolvePost(ctx.req);
    const { fileHash, filename } = data;
    const ext = extractExt(filename);
    const filePath = path.resolve(path.resolve(__dirname, './public/images'), `${fileHash}${ext}`);
    if (fse.existsSync(filePath)) {
        ctx.body = `{
             "shouldUpload": ${false}
         }`;
    } else {
        let data = await resD
        ctx.body = {
            uploadedList: data,
            shouldUpload: true
        };
    }
});

const resolvePost = req =>
    new Promise(resolve => {
        let chunk = "";
        req.on("data", data => {
            chunk += data;
        });
        req.on("end", () => {
            resolve(JSON.parse(chunk));
        });
    });

var uploadHost = `http://localhost:${port}/uploads/`;

app.use(koaBody({
    formidable: {
        //设置文件的默认保存目录，不设置则保存在系统临时目录下  
        uploadDir: path.resolve(__dirname, './public/images')
    },
    multipart: true // 支持文件上传
}));

app.use(koaStatic(
    path.resolve(__dirname, './public')
));


//二次处理文件，修改名称
app.use((ctx) => {
    var body = ctx.request.body;
    var files = ctx.request.files ? ctx.request.files.f1 : [];//得到上传文件的数组
    var result = [];
    var fileHash = ctx.request.body.fileHash // 文件標識
    var fileIndex = ctx.request.body.idx;//文件顺序
    if (files && !Array.isArray(files)) {//单文件上传容错
        files = [files];
    }

    files && files.forEach(item => {
        var path = item.path.replace(/\\/g, '/');
        var nextPath = path.slice(0, path.lastIndexOf('/') + 1) + fileIndex + '-' + fileHash;
        console.log('next');
        console.log('next', nextPath);
        if (item.size > 0 && path) {
            //重命名文件
            fs.renameSync(path, nextPath);
            result.push(uploadHost + nextPath.slice(nextPath.lastIndexOf('/') + 1));
        }
    });

    ctx.body = `{
          "fileUrl":${JSON.stringify(result)}
      }`;
    if (body.type === 'merge') {
        //合并文件
        console.log('merge');
        console.log('chunkCount', chunkCount);
        var filename = body.filename,
            chunkCount = body.chunkCount,
            fileHash = body.fileHash,
            folder = path.resolve(__dirname, './public/images') + '/';
        var extArr = filename.split('.');
        var ext = extArr[extArr.length - 1];
        var writeStream = fs.createWriteStream(`${folder}${fileHash}.${ext}`);
        var cindex = 0;
        //合并文件
        function fnMergeFile() {
            var fname = `${folder}${cindex}-${fileHash}`;
            var readStream = fs.createReadStream(fname);
            readStream.pipe(writeStream, { end: false });
            readStream.on("end", function () {
                fs.unlink(fname, function (err) {
                    if (err) {
                        throw err;
                    }
                });
                if (cindex + 1 < chunkCount) {
                    cindex += 1;
                    fnMergeFile();
                }
            });
        }

        try {
            fnMergeFile();
        } catch (error) {

        }


        ctx.body = 'merge ok 200';
    }

});

/**
 * Create HTTP server.
 */
var server = http.createServer(app.callback());
server.listen(port);


console.log('8100 server start ......   ');